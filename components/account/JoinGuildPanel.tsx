import LinkButton from '@/components/LinkButton';
import { Page } from '@/Enum/Page';
import React from 'react';
import Panel from '@/components/Panel';

export default function JoinGuildPanel () {
    return (
        <Panel title="Klub">
            <p className="mb-3">
                Nie jesteś jeszcze w Klubie. Dołącz do towarzyszy i wspólnie wyruszcie w przygodę!
            </p>
            <LinkButton href={Page.GUILD}>Dołącz do klubu</LinkButton>
        </Panel>
    );
}
