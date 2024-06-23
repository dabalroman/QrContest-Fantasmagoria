import Panel from '@/components/Panel';
import RankingRound from '@/models/RankingRound';

export default function CurrentRoundPanel ({
    currentRound,
    loading
}: { currentRound: RankingRound, loading: boolean }) {
    const now = new Date();

    const percentage =
        (now.getTime() - currentRound.from.getTime()) / (currentRound.to.getTime() - currentRound.from.getTime()) * 100;
    const progressValue = Math.min(Math.max(percentage, 0), 100);

    const notStartedYet = percentage <= 0;
    const alreadyFinished = percentage >= 100;

    return (
        <Panel
            title={'Runda ' + (currentRound && currentRound?.name)}
            loading={loading}
        >
            {currentRound && (
                <>
                    <div className={'flex justify-between'}>
                        <div>{currentRound.from.toLocaleString(
                            'pl-PL',
                            {
                                dateStyle: 'short',
                                timeStyle: 'short'
                            }
                        )}</div>
                        <div>{currentRound.to.toLocaleString(
                            'pl-PL',
                            {
                                dateStyle: 'short',
                                timeStyle: 'short'
                            }
                        )}</div>
                    </div>
                    <div className="h-8 w-full mt-2 border-card-border border-2 rounded-md relative">
                        <div style={{ width: progressValue + '%' }}
                             className={
                                 'bg-card-border h-full absolute z-0'
                                 + (!(notStartedYet || alreadyFinished) ? ' animate-pulse' : '')
                             }>
                        </div>
                        <div className={'h-full w-full flex justify-center items-center'}>
                            {notStartedYet &&
                                <span className="z-10">Runda jeszcze się nie rozpoczęła</span>}
                            {alreadyFinished &&
                                <span className="text-text-accent z-10">Runda została zakończona</span>}
                            {!(notStartedYet || alreadyFinished) &&
                                <span className={"z-10" + (progressValue >= 50 ? ' text-text-accent' : '')}>
                                    {progressValue.toFixed(0)}%
                                </span>
                            }
                        </div>
                    </div>
                </>
            )}
        </Panel>
    );
}
