export class TagDetailObject {
    name: string;
    count: number;

    constructor(tag) {
        this.name = tag.name;
        this.count = tag.count;
    }
}
