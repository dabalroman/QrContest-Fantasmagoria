import { ReactNode } from 'react';
import { getMap, getMapsInArea, MAP_AREA_LABELS, MAP_AREAS } from '@/utils/maps';

// Peer areas on top; picking MOK/2LO reveals that building's floor strip (rendered from the registry,
// so adding a level is one line). Dwór has no floors → no strip. `adminToggle` is an optional slot
// rendered above the area row - /map drops the admin edit-mode switch in here so it sits with the picker.
export default function MapAreaToggle ({
    activeMapId,
    onSelect,
    adminToggle
}: { activeMapId: string, onSelect: (mapId: string) => void, adminToggle?: ReactNode }) {
    const activeArea = getMap(activeMapId)?.area ?? MAP_AREAS[0];
    const floors = getMapsInArea(activeArea);
    const showFloorStrip = floors.some((floor) => floor.floorLabel !== null);

    const pill = (selected: boolean, small = false): string =>
        (small ? 'px-3 py-1 text-sm ' : 'px-4 py-2 ')
        + 'rounded-xl font-semibold shadow-panel transition-colors pointer-events-auto '
        + (selected
            ? 'bg-button-accent text-text-light'
            : 'bg-panel-transparent text-text-accent backdrop-blur-md');

    // pointer-events-none on the bar so it floats over the map without eating pans; each button
    // re-enables pointer events (pill() adds pointer-events-auto; the admin toggle adds its own).
    return (
        <div className="flex flex-col gap-2 p-2 pointer-events-none">
            <div className="flex gap-2 justify-center items-center flex-wrap">
                {MAP_AREAS.map((area) => (
                    <button
                        key={area}
                        onClick={() => onSelect(getMapsInArea(area)[0].mapId)}
                        className={pill(area === activeArea)}
                    >
                        {MAP_AREA_LABELS[area]}
                    </button>
                ))}
                {adminToggle}
            </div>

            {showFloorStrip &&
                <div className="flex gap-2 justify-center flex-wrap">
                    {floors.map((floor) => (
                        <button
                            key={floor.mapId}
                            onClick={() => onSelect(floor.mapId)}
                            className={pill(floor.mapId === activeMapId, true)}
                        >
                            {floor.floorLabel}
                        </button>
                    ))}
                </div>
            }
        </div>
    );
}
