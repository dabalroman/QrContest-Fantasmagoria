import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { faArrowLeft, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import Button from '@/components/Button';
import useAdminOnly from '@/hooks/useAdminOnly';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { getPhotoSubmissionsFunction, reviewPhotoFunction } from '@/utils/functions';
import { RawPhotoSubmission } from '@/models/Raw';

// Admin review queue for photo-proof pins (#19). Lists pending submissions (photo + player + pin task)
// and approves (awards points) / rejects (reopens the pin for retry) each via reviewPhotoFunction. The
// queue is a one-shot fetch (getPhotoSubmissionsFunction) refreshed after each decision — not a live
// listener, since `photoSubmissions` is admin-only-read-via-callable.
export default function PhotoReviewAdminPage () {
    useAdminOnly();

    const router = useRouter();
    const [submissions, setSubmissions] = useState<RawPhotoSubmission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [busyUid, setBusyUid] = useState<string | null>(null);

    useDynamicNavbar({
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    const reload = useCallback(() => {
        setLoading(true);
        getPhotoSubmissionsFunction({})
            .then((result) => setSubmissions(result.data.submissions))
            .catch((error) => {
                console.error(error);
                toast.error('Nie udało się wczytać zgłoszeń.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const review = (submissionUid: string, decision: 'approve' | 'reject') => {
        setBusyUid(submissionUid);
        reviewPhotoFunction({ submissionUid, decision })
            .then(() => {
                toast.success(decision === 'approve' ? 'Zatwierdzono.' : 'Odrzucono.');
                setSubmissions((current) => current.filter((entry) => entry.submissionUid !== submissionUid));
            })
            .catch((error) => {
                console.error(error);
                toast.error('Nie udało się zapisać decyzji.');
                reload();
            })
            .finally(() => setBusyUid(null));
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Zdjęcia do weryfikacji</ScreenTitle>

            <div>
                {!loading && submissions.length === 0 &&
                    <Panel>
                        <p className="text-center font-semibold">Brak zgłoszeń do weryfikacji.</p>
                    </Panel>
                }

                {loading && submissions.length === 0 &&
                    <Panel loading={true}><span/></Panel>
                }

                {submissions.map((submission) => (
                    <Panel key={submission.submissionUid} title={submission.pinName} loading={busyUid === submission.submissionUid}>
                        <p className="mb-2">
                            <b>{submission.username}</b> · {submission.value} pkt
                        </p>

                        {submission.photoUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img
                                src={submission.photoUrl}
                                alt={`Zdjęcie od ${submission.username}`}
                                className="rounded-xl mx-auto max-h-80 object-contain"
                            />
                            : <p className="text-center text-text-dim">Nie udało się wczytać zdjęcia.</p>
                        }

                        <div className="flex gap-2 mt-3">
                            <Button onClick={() => review(submission.submissionUid, 'approve')} className="w-full">
                                <FontAwesomeIcon icon={faCheck}/> Zatwierdź
                            </Button>
                            <Button onClick={() => review(submission.submissionUid, 'reject')} className="w-full">
                                <FontAwesomeIcon icon={faXmark}/> Odrzuć
                            </Button>
                        </div>
                    </Panel>
                ))}
            </div>
        </main>
    );
}
