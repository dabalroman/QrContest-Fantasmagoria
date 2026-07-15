export type RawFantasmagoriaProgramEntry = {
    category: string,
    date_end: string,
    date_start: string,
    description: string,
    id: number,
    location: string,
    name: string,
    title: string,
}

export default class FantasmagoriaProgramEntry {
    name: string;
    title: string;
    description: string;
    category: string;
    location: string;
    dateStart: Date;
    dateEnd: Date;

    constructor (
        name: string,
        title: string,
        description: string,
        category: string,
        location: string,
        dateStart: Date,
        dateEnd: Date,
    ) {
        this.name = name;
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
    }

    public get durationHours(): number {
        return (this.dateEnd.getTime() - this.dateStart.getTime()) / (60 * 60 * 1000);
    }

    public static fromRaw(raw: RawFantasmagoriaProgramEntry) {
        return new FantasmagoriaProgramEntry(
            raw.name,
            raw.title,
            raw.description,
            raw.category,
            raw.location,
            new Date(raw.date_start),
            new Date(raw.date_end)
        );
    }
}
