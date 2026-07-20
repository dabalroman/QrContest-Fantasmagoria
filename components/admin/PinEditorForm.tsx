import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faXmark } from '@fortawesome/free-solid-svg-icons';
import Pin, { PinCoords } from '@/models/Pin';
import PinGroup from '@/models/PinGroup';
import { getPinTypeFriendlyName, PinType } from '@/Enum/PinType';
import { CardTier, getCardTierFriendlyName, getCardTierValue } from '@/Enum/CardTier';
import { RawPinAuthoredFields } from '@/models/Raw';
import { deletePinFunction, upsertPinFunction } from '@/utils/functions';
import Panel from '@/components/Panel';
import Button from '@/components/Button';
import CodeScanner from '@/components/CodeScanner';

type FormValues = {
    name: string;
    description: string;
    clue: string;
    type: PinType;
    groups: string[];
    coordsX: number;
    coordsY: number;
    tier: CardTier;
    hintRadius: string;
    withQuestion: boolean;
    isActive: boolean;
    availableFrom: string;
    availableTo: string;
    code: string;
};

function needsCode (type: PinType): boolean {
    return type === PinType.CODE || type === PinType.RIDDLE;
}

// Points are picked by rarity, reusing the card tier scale (Enum/CardTier). The pin still stores a
// plain `value`; the picker is UI-only. On edit we reverse-map the stored value back to its tier,
// falling back to the lowest tier for any legacy/off-scale value.
function tierFromValue (value: number): CardTier {
    return Object.values(CardTier).find((tier) => getCardTierValue(tier) === value) ?? CardTier.COMMON;
}

function toDatetimeLocal (date: Date | null): string {
    if (!date) {
        return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal (value: string): number | null {
    if (!value.trim()) {
        return null;
    }
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
}

const inputClass = 'rounded-xl block w-full p-2 border-2 border-input-border bg-input-background text-text-accent';

// The admin editor's mobile form — react-hook-form, Polish labels/toasts throughout. The payload sent
// to upsertPinHandle is ALWAYS the complete authored field set (never a partial patch), which is why
// every field below has a value even in edit mode.
//
// The parent remounts this component (key={pin?.uid ?? 'draft'}) whenever the edited target changes,
// so plain `defaultValues` are enough here — the pin is already in hand at mount time.
//
// Coordinates are a plain editable X/Y pair rather than drag-to-reposition (CUTTABLE, skipped) — typing
// a coordinate is the same "manual entry is the guaranteed path" principle the code field already
// follows. Re-tapping the map only ever starts a NEW pin, never moves this one.
export default function PinEditorForm ({
    pin,
    mapId,
    coords,
    groups,
    onSaved,
    onDeleted,
    onCancel
}: {
    pin: Pin | null,
    mapId: string,
    coords: PinCoords,
    groups: PinGroup[],
    onSaved: () => void,
    onDeleted: () => void,
    onCancel: () => void
}) {
    const [saving, setSaving] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [scanning, setScanning] = useState<boolean>(false);

    const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
            name: pin?.name ?? '',
            description: pin?.description ?? '',
            clue: pin?.clue ?? '',
            type: pin?.type ?? PinType.CODE,
            groups: pin?.groups ?? [],
            coordsX: coords.x,
            coordsY: coords.y,
            tier: pin ? tierFromValue(pin.value) : CardTier.COMMON,
            hintRadius: String(pin?.hintRadius ?? 0),
            withQuestion: pin?.withQuestion ?? false,
            isActive: pin?.isActive ?? true,
            availableFrom: toDatetimeLocal(pin?.availableFrom ?? null),
            availableTo: toDatetimeLocal(pin?.availableTo ?? null),
            code: pin?.code ?? ''
        }
    });

    const currentType = watch('type');
    const hasFinders = pin !== null && Object.keys(pin.collectedBy).length > 0;

    const onSubmit = async (values: FormValues) => {
        if (pin && hasFinders) {
            const codeChanged = needsCode(values.type)
                && values.code.trim().toUpperCase() !== (pin.code ?? '').toUpperCase();
            const sensitiveChange = values.type !== pin.type
                || getCardTierValue(values.tier) !== pin.value
                || codeChanged;

            if (sensitiveChange && !confirm(
                'Ta pinezka ma już znalazców. Zmiana typu, wartości albo kodu może zaburzyć ich wynik '
                + '(kod jest już wydrukowany na naklejce). Kontynuować?'
            )) {
                return;
            }
        }

        setSaving(true);
        try {
            const fields: RawPinAuthoredFields = {
                name: values.name.trim(),
                description: values.description,
                clue: values.clue,
                type: values.type,
                groups: values.groups ?? [],
                mapId,
                coords: { x: Number(values.coordsX), y: Number(values.coordsY) },
                hintRadius: Number(values.hintRadius) > 0 ? Number(values.hintRadius) : null,
                value: getCardTierValue(values.tier),
                withQuestion: values.withQuestion,
                isActive: values.isActive,
                availableFrom: fromDatetimeLocal(values.availableFrom),
                availableTo: fromDatetimeLocal(values.availableTo),
                code: needsCode(values.type) ? values.code.trim() : null
            };

            await upsertPinFunction({ pinUid: pin?.uid ?? null, fields });
            onSaved();
        } catch (error: any) {
            toast.error('Błąd zapisu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!pin) {
            return;
        }

        const warning = hasFinders
            ? 'Ta pinezka ma już znalazców — usunięcie nie cofnie przyznanych im punktów, ale stracisz '
                + 'listę odkrywców. Na pewno usunąć?'
            : 'Na pewno usunąć tę pinezkę?';

        if (!confirm(warning)) {
            return;
        }

        setDeleting(true);
        try {
            await deletePinFunction({ pinUid: pin.uid });
            onDeleted();
        } catch (error: any) {
            toast.error('Błąd usuwania: ' + error.message);
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-30 bg-black/40" onClick={onCancel}/>
            <div
                className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-3xl
                    bg-background p-4 pb-32 shadow-panel"
            >
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 z-10 text-text-accent"
                    aria-label="Zamknij"
                >
                    <FontAwesomeIcon icon={faXmark} size="2x"/>
                </button>

                <Panel title={pin ? 'Edycja pinezki' : 'Nowa pinezka'} loading={saving || deleting}>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                        <label className="block">
                            <span className="block pb-1">Nazwa</span>
                            <input type="text" className={inputClass} {...register('name', { required: true })}/>
                        </label>

                        <label className="block">
                            <span className="block pb-1">Opis</span>
                            <textarea className={inputClass} rows={3} {...register('description')}/>
                        </label>

                        <label className="block">
                            <span className="block pb-1">Wskazówka</span>
                            <textarea className={inputClass} rows={2} {...register('clue')}/>
                        </label>

                        <label className="block">
                            <span className="block pb-1">Typ</span>
                            <select className={inputClass} {...register('type')}>
                                {Object.values(PinType).map((type) => (
                                    <option key={type} value={type}>{getPinTypeFriendlyName(type)}</option>
                                ))}
                            </select>
                        </label>

                        <div>
                            <span className="block pb-1">Grupy</span>
                            <div className="flex flex-wrap gap-2">
                                {groups.map((group) => (
                                    <label
                                        key={group.uid}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg
                                            border-2 border-input-border bg-input-background"
                                    >
                                        <input type="checkbox" value={group.uid} {...register('groups')}/>
                                        <span>{group.name}</span>
                                    </label>
                                ))}
                                {groups.length === 0 &&
                                    <span className="text-sm opacity-70">Brak zdefiniowanych grup.</span>
                                }
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="block pb-1">Współrzędna X</span>
                                <input
                                    type="number"
                                    className={inputClass}
                                    {...register('coordsX', { required: true, valueAsNumber: true })}
                                />
                            </label>
                            <label className="block">
                                <span className="block pb-1">Współrzędna Y</span>
                                <input
                                    type="number"
                                    className={inputClass}
                                    {...register('coordsY', { required: true, valueAsNumber: true })}
                                />
                            </label>
                        </div>

                        <p className="text-sm opacity-70 -mt-2">
                            Piętro: {mapId}. Aby umieścić NOWĄ pinezkę gdzie indziej, zamknij formularz
                            i stuknij mapę ponownie — tę pinezkę przesuniesz, poprawiając X/Y ręcznie.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="block pb-1">Rzadkość</span>
                                <select className={inputClass} {...register('tier')}>
                                    {Object.values(CardTier).map((tier) => (
                                        <option key={tier} value={tier}>
                                            {getCardTierFriendlyName(tier)} ({getCardTierValue(tier)} pkt)
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="block pb-1">Promień podpowiedzi</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    placeholder="0 = brak"
                                    className={inputClass}
                                    {...register('hintRadius')}
                                />
                            </label>
                        </div>

                        {needsCode(currentType) &&
                            <div className="block">
                                <span className="block pb-1">
                                    {currentType === PinType.CODE ? 'Kod' : 'Odpowiedź'}
                                </span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={inputClass + ' uppercase pr-12'}
                                        placeholder={currentType === PinType.CODE ? 'ABCDEFGHIJ' : 'Twoja odpowiedź'}
                                        {...register('code', { required: true })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setScanning(true)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-text-accent"
                                        aria-label="Skanuj kod"
                                    >
                                        <FontAwesomeIcon icon={faQrcode}/>
                                    </button>
                                </div>
                            </div>
                        }

                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...register('withQuestion')}/>
                                <span>Z pytaniem?</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...register('isActive')}/>
                                <span>Aktywna?</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="block pb-1">Dostępne od</span>
                                <input type="datetime-local" className={inputClass} {...register('availableFrom')}/>
                            </label>
                            <label className="block">
                                <span className="block pb-1">Dostępne do</span>
                                <input type="datetime-local" className={inputClass} {...register('availableTo')}/>
                            </label>
                        </div>

                        {hasFinders &&
                            <p className="text-sm text-center opacity-80">
                                Tę pinezkę znalazło już {Object.keys(pin!.collectedBy).length}{' '}
                                {Object.keys(pin!.collectedBy).length === 1 ? 'osoba' : 'osób'}.
                            </p>
                        }

                        <Button type="submit" className="w-full mt-2">Zapisz</Button>

                        {pin &&
                            <Button
                                type="button"
                                className="w-full"
                                style={{ background: '#660000', borderColor: '#BB0000' }}
                                onClick={onDelete}
                            >
                                Usuń pinezkę
                            </Button>
                        }
                    </form>
                </Panel>
            </div>

            {scanning &&
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4">
                    <CodeScanner
                        allowBareCode
                        className="w-full max-w-lg rounded-2xl"
                        onCode={(code) => {
                            setValue('code', code, { shouldDirty: true });
                            setScanning(false);
                            toast.success('Kod zeskanowany.');
                        }}
                    />
                    <Button type="button" className="w-full max-w-lg" onClick={() => setScanning(false)}>
                        Anuluj
                    </Button>
                </div>
            }
        </>
    );
}
