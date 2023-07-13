import LinkButton from '@/components/LinkButton';
import { Page } from '@/Enum/Page';
import React from 'react';
import Panel from '@/components/Panel';

export default function JoinGuildPanel () {
    return (
        <Panel title="Gildia">
            <p className="mb-3">
                Nie jesteś członkiem żadnej gildii. Dołącz do towarzyszy i wspólnie wyruszcie w przygodę!
            </p>
            <LinkButton href={Page.GUILD}>Dołącz do gildii</LinkButton>
        </Panel>
    );
}
