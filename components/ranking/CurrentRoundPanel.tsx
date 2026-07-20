import Panel from '@/components/Panel';
import ProgressBar from '@/components/ProgressBar';
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

    let roundLabel = progressValue.toFixed(0) + '%';

    if (notStartedYet) {
        roundLabel = 'Runda jeszcze się nie rozpoczęła';
    } else if (alreadyFinished) {
        roundLabel = 'Runda została zakończona';
    }

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
                    <div className="mt-2">
                        <ProgressBar
                            percentage={progressValue}
                            label={roundLabel}
                            pulse={!(notStartedYet || alreadyFinished)}
                        />
                    </div>
                </>
            )}
        </Panel>
    );
}
