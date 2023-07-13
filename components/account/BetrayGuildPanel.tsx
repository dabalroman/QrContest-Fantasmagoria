import Guild from '@/models/Guild';
import React from 'react';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import { Page } from '@/Enum/Page';
import Button, { ButtonState } from '@/components/Button';
import User from '@/models/User';

export default function BetrayGuildPanel ({
    user,
    guild
}: { user: User, guild: Guild }) {
    return (
        <Panel title="Zdrada Gildii">
            <p className="mb-3">Możesz zdradzić swoich towarzyszy, by dołączyć do innej gildii.
                Zmiany możesz dokonać tylko raz na 4 godziny.</p>
            {
                guild?.canGuildBeChanged(user.lastGuildChangeAt)
                    ? <LinkButton href={Page.GUILD}>Zdradź Gildię</LinkButton>
                    : <Button state={ButtonState.DISABLED} className="w-full">
                        Zdrada nie jest jeszcze możliwa
                    </Button>
            }

        </Panel>
    );
}
