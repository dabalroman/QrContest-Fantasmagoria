import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

initializeApp();

exports.addmessage = onRequest(async (req, res) => {
        const original = req.body.data.text ?? 'empty';
        logger.log(original);

        const writeResult = await getFirestore()
            .collection('messages')
            .add({ original: original });

        res.json({ result: `Message with ID: ${writeResult.id} added.` });
    }
);

exports.makeuppercase = onDocumentCreated('/messages/{documentId}', (event) => {
    const original = event.data?.data().original;

    logger.log('Uppercasing', event.params.documentId, original);

    const uppercase = original.toUpperCase();
    return event.data?.ref.set({ uppercase }, { merge: true });
});

