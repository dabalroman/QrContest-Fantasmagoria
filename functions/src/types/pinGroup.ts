// A pin `groups[]` taxonomy entry: definitions are DATA (mirrors achievement.ts) so a group can be
// added mid-event with no redeploy. Nothing consumes groups[] yet (no group-completion badge exists),
// but this establishes the taxonomy cleanly before anything depends on it.
export type PinGroup = {
    uid: string,
    name: string,
    icon?: string
};
