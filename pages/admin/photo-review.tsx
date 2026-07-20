import { useCallback, useEffect, useRef, useState } from 'react';
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

// New submissions should appear on their own so the screen can stay open. This is a POLL, not a live
// listener: the photo thumbnails are server-built download-token URLs (`photoSubmissions` is
// admin-read-via-callable and the Storage objects are owner-only, so an admin client cannot build the
// URLs itself), the same reason usePinsData polls getPins. Background polls never flash the loader, and
// the photoUrl for a given object is stable (same token), so an unchanged <img src> does not reflicker.
const POLL_INTERVAL_MS = 15 * 1000;

// Admin review queue for photo-proof pins (#19). Approves (awards points) / rejects (reopens the pin
// for retry) each pending submission via reviewPhotoFunction.
export default function PhotoReviewAdminPage () {
    useAdminOnly();

    const router = useRouter();
    const [submissions, setSubmissions] = useState<RawPhotoSubmission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [busyUid, setBusyUid] = useState<string | null>(null);

    // Submissions already reviewed this session. A poll that was already in flight when a decision
    // committed could otherwise briefly re-add the row it returned before the server-side change; we
    // filter them out of every render so a reviewed row never flickers back.
    const dismissedRef = useRef<Set<string>>(new Set());

    useDynamicNavbar({
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    const reload = useCallback((silent: boolean = false) => {
        if (!silent) {
            setLoading(true);
        }
        getPhotoSubmissionsFunction({})
            .then((result) => {
                setSubmissions(result.data.submissions.filter(
                    (entry) => !dismissedRef.current.has(entry.submissionUid)
                ));
            })
            .catch((error) => {
                console.error(error);
                // A failed background poll is silent — no toast spam on an always-open screen.
                if (!silent) {
                    toast.error('Nie udało się wczytać zgłoszeń.');
                }
            })
            .finally(() => {
                if (!silent) {
                    setLoading(false);
                }
            });
    }, []);

    useEffect(() => {
        reload();

        const interval = window.setInterval(() => reload(true), POLL_INTERVAL_MS);
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                reload(true);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [reload]);

    const review = (submissionUid: string, decision: 'approve' | 'reject') => {
        setBusyUid(submissionUid);
        reviewPhotoFunction({ submissionUid, decision })
            .then(() => {
                toast.success(decision === 'approve' ? 'Zatwierdzono.' : 'Odrzucono.');
                dismissedRef.current.add(submissionUid);
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
