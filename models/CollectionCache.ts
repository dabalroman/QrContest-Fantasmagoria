import FirebaseModel from '@/models/FirebaseModel';

export default class CollectionCache<T extends FirebaseModel> {
    private readonly data: T[];

    constructor (data: T[] = []) {
        this.data = data;
    }

    get (): T[] {
        return this.data;
    }
}
