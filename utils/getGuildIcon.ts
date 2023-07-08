import { GuildUid } from '@/models/Guild';
import { faCircle, faDiamond, faDroplet, faFireFlameCurved, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export default function getGuildIcon (guildUid: GuildUid): IconDefinition {
    if (guildUid === GuildUid.desert) {
        return faFireFlameCurved;
    }

    if (guildUid === GuildUid.steel) {
        return faDiamond;
    }

    if (guildUid === GuildUid.water) {
        return faDroplet;
    }

    return faCircle;
}
