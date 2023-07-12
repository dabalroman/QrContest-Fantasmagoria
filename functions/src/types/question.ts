import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Timestamp = firestore.Timestamp;

export type QuestionValue = 5 | 10 | 15;

export type QuestionAnswerValue = 'a' | 'b' | 'c' | 'd';

export type QuestionAnswers = { [index in QuestionAnswerValue]: string };

export type Question = {
    uid: string;
    question: string;
    answers: QuestionAnswers,
    correct: QuestionAnswerValue,
    value: QuestionValue,
    updatedAt: Timestamp | FieldValue;
}

export type PublicQuestion = {
    uid: string,
    question: string,
    answers: QuestionAnswers,
    value: QuestionValue
}

export type CollectedQuestions = {
    [uid: string]: {
        answer: QuestionAnswerValue,
        value: QuestionValue,
        isCorrect: boolean,
        collectedAt: Timestamp | FieldValue
    }
}

export type QuestionsDoc = {
    [uid: string] : Question;
}
