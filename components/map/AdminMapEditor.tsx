import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { collection, onSnapshot } from '@firebase/firestore';
import Loader from '@/components/Loader';
import PinEditorForm from '@/components/admin/PinEditorForm';
import Pin, { PinCoords } from '@/models/Pin';
import PinGroup from '@/models/PinGroup';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';

// Leaflet touches window at module scope → client-only, same as pages/map.tsx.
const MapCanvas = dynamic(() => import('@/components/map/MapCanvas'), {
    ssr: false,
    loading: () => <Loader/>
});

// The admin editing surface, swapped into /map when an admin flips edit mode. Structurally last year's
// card editor made map-native: the map IS the list — tap a marker to edit it, tap empty map to create
// one at those coords. The parent (/map) owns the area/floor picker and passes the active floor in;
// this component owns only the editing state, so play mode and edit mode share one picker.
export default function AdminMapEditor ({ activeMapId }: { activeMapId: string }) {
    // Full docs, incl. the real `code` AND inactive drafts — getPins strips both, which is exactly what
    // a player must never see but the editor needs. Accepted trade-off: secrets live in the admin
    // phone's memory (codes are on physical stickers anyway).
    const [pins, setPins] = useState<Pin[] | null>(null);
    const [groups, setGroups] = useState<PinGroup[] | null>(null);
    const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
    // Staged position of whatever is under edit — a brand-new pin, or a moved existing one. Owned here
    // rather than in the form so arming placement can HIDE the drawer instead of unmounting it: the form
    // is remounted by `key` below, so an unmount would throw away every unsaved field edit.
    const [pendingCoords, setPendingCoords] = useState<PinCoords | null>(null);
    const [placing, setPlacing] = useState<boolean>(false);

    useEffect(() => {
        return onSnapshot(
            collection(firestore, FireDoc.PINS).withConverter(Pin.getConverter()),
            (snapshot) => setPins(snapshot.docs.map((doc) => doc.data() as Pin)),
            (error) => {
                console.error(error);
                toast.error('Nie udało się wczytać pinezek.');
            }
        );
    }, []);

    useEffect(() => {
        return onSnapshot(
            collection(firestore, FireDoc.PIN_GROUPS).withConverter(PinGroup.getConverter()),
            (snapshot) => setGroups(snapshot.docs.map((doc) => doc.data() as PinGroup)),
            (error) => {
                console.error(error);
                toast.error('Nie udało się wczytać grup pinezek.');
            }
        );
    }, []);

    // Reuse of collectedUids: the editor passes INACTIVE pins through it, so an inactive pin is greyed
    // on the canvas and its hint circle suppressed — no new prop needed.
    const inactiveUids = useMemo(
        () => new Set((pins ?? []).filter((pin) => !pin.isActive).map((pin) => pin.uid)),
        [pins]
    );

    const onMapClick = (coords: PinCoords) => {
        // Armed: stage the tap for the pin already under edit and bring the drawer back. Nothing is
        // written until the form's Zapisz, so a mis-tap is undone by pressing Przesuń and tapping again.
        if (placing) {
            setPendingCoords(coords);
            setPlacing(false);
            return;
        }

        setSelectedPin(null);
        setPendingCoords(coords);
    };

    const onPinClick = (pin: Pin) => {
        setPendingCoords(null);
        setSelectedPin(pin);
    };

    const closeEditor = () => {
        setSelectedPin(null);
        setPendingCoords(null);
        setPlacing(false);
    };

    const onSaved = () => {
        toast.success('Pinezka zapisana.');
        closeEditor();
    };

    const onDeleted = () => {
        toast.success('Pinezka usunięta.');
        closeEditor();
    };

    const isEditing = selectedPin !== null || pendingCoords !== null;

    if (!pins) {
        return <Loader/>;
    }

    return (
        <>
            <MapCanvas
                pins={pins}
                activeMapId={activeMapId}
                collectedUids={inactiveUids}
                onPinClick={onPinClick}
                onMapClick={onMapClick}
                draft={pendingCoords ? { coords: pendingCoords, hintRadius: null } : null}
                placing={placing}
            />

            {placing &&
                <div className="absolute inset-x-0 bottom-0 z-20 p-3 text-center pointer-events-none">
                    <span className="inline-block px-4 py-2 rounded-xl font-semibold shadow-panel
                        bg-panel-transparent text-text-accent backdrop-blur-md">
                        Stuknij mapę, aby ustawić pinezkę.
                    </span>
                </div>
            }

            {isEditing &&
                <PinEditorForm
                    // Remount on target swap — plain defaultValues are then enough (no setValue effect
                    // needed to re-sync mid-life). Placement only HIDES it, so edits survive a move.
                    key={selectedPin?.uid ?? 'draft'}
                    pin={selectedPin}
                    mapId={activeMapId}
                    coords={pendingCoords ?? selectedPin?.coords ?? { x: 0, y: 0 }}
                    groups={groups ?? []}
                    hidden={placing}
                    onRequestMove={() => setPlacing(true)}
                    onSaved={onSaved}
                    onDeleted={onDeleted}
                    onCancel={closeEditor}
                />
            }
        </>
    );
}
