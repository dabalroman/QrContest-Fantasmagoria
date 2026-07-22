import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import getAchievementIcon from '@/utils/getAchievementIcon';

// The single place an achievement icon is rendered - so swapping FontAwesome for custom .webp art
// later is a one-file change (this becomes an <img src={`/achievements/${iconKey}.webp`}/>), leaving
// the definitions and every caller untouched. Reused by #30's unlock toast.
export default function AchievementIcon ({
    iconKey,
    className = ''
}: { iconKey: string, className?: string }) {
    return (
        <FontAwesomeIcon icon={getAchievementIcon(iconKey)} className={className}/>
    );
}
