import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type QuestionValue = 0 | 5 | 10 | 15;

export type QuestionAnswerCorrectValue = 'a' | 'b' | 'c' | 'd';
export type QuestionAnswerValue = QuestionAnswerCorrectValue | null;

export type QuestionAnswers = { [index in QuestionAnswerCorrectValue]: string };

export type Question = {
    uid: string;
    question: string;
    answers: QuestionAnswers,
    correct: QuestionAnswerValue,
    value: QuestionValue,
    updatedAt: Timestamp | FieldValue | number;
}

export type PublicQuestion = {
    uid: string,
    question: string,
    answers: QuestionAnswers,
    value: QuestionValue
}

export type CollectedCardQuestion = {
    answer: QuestionAnswerValue,
    value: QuestionValue,
    correct: boolean,
    collectedAt: Timestamp | FieldValue
}

export type CollectedQuestions = {
    [uid: string]: CollectedCardQuestion
}

export type QuestionsDoc = {
    [uid: string] : Question;
}
