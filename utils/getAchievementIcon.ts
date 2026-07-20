import {
    faBuilding,
    faCrown,
    faGraduationCap,
    faLocationDot,
    faMedal,
    faTrophy,
    IconDefinition
} from '@fortawesome/free-solid-svg-icons';

// `icon` on an achievement definition is a string KEY (never an IconDefinition — nothing serializes an
// icon over the wire), so the client maps it here. Mirrors utils/getPinIcon.ts. Shared with #30's
// unlock toast, so keep it a plain key→icon lookup with a safe fallback for an unknown/edited key.
// Note: FontAwesome free-solid has no owl (faOwl is Pro-only); faGraduationCap stands in for the
// answer/quiz achievements.
export default function getAchievementIcon (iconKey: string): IconDefinition {
    if (iconKey === 'medal') {
        return faMedal;
    }

    if (iconKey === 'trophy') {
        return faTrophy;
    }

    if (iconKey === 'crown') {
        return faCrown;
    }

    if (iconKey === 'owl') {
        return faGraduationCap;
    }

    if (iconKey === 'map-pin') {
        return faLocationDot;
    }

    if (iconKey === 'building') {
        return faBuilding;
    }

    return faMedal;
}
