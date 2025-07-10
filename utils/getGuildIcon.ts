import {GuildUid} from '@/models/Guild';
import {faDiceD20, faFilm, faShrimp, faYinYang, IconDefinition} from '@fortawesome/free-solid-svg-icons';

export default function getGuildIcon(guildUid: GuildUid): IconDefinition {
    if (guildUid === GuildUid.desert) {
        return faFilm;
    }

    if (guildUid === GuildUid.steel) {
        return faDiceD20;
    }

    if (guildUid === GuildUid.water) {
        return faShrimp;
    }

    return faYinYang;
}
