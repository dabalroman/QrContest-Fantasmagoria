// Mirrors the map registry in utils/maps.ts. The client owns the FULL MapDefinition (image path,
// pixel size, floor label) because it is the one file allowed to touch Leaflet; functions/src has no
// `@/` alias and cannot pull in a Leaflet-typed module, so this is a hand-kept list of valid mapIds
// only, used to validate upsertPinHandle's `mapId` field. Add an id here whenever utils/maps.ts gains
// one - NINE maps today: Dwór (no floors) + MOK's 5 levels + 2LO's 3.
const mapIds: string[] = [
    'dwor',
    'mok-piwnica', 'mok-parter', 'mok-pietro-1', 'mok-pietro-1-5', 'mok-pietro-2',
    '2lo-parter', '2lo-pietro-1', '2lo-pietro-2'
];

export default mapIds;
