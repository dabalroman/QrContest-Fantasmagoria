import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { StringMap, Uid } from '@/types/global';
import { RawQuestion } from '@/models/Raw';

export default class Question extends FirebaseModel {
    uid: Uid;
    question: string;
    answers: StringMap;
    value: number;

    constructor (
        uid: Uid,
        question: string,
        answers: StringMap,
        value: number
    ) {
        super();

        this.uid = uid;
        this.question = question;
        this.answers = answers;
        this.value = value;
    }

    public static fromRaw (rawQuestion: RawQuestion): Question {
        return new Question(
            rawQuestion.uid,
            rawQuestion.question,
            rawQuestion.answers,
            rawQuestion.value
        );
    }

    protected static toFirestore (data: Question): object {
        throw new Error('Question is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): Question {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new Question(
            data.uid,
            data.question,
            data.answers,
            data.value
        );
    }
}


