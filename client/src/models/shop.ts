
export class Shop {
    constructor(
        public _id: string,
        public name: string,
        public address: string,
        public lng: number,
        public lat: number,
        public tags: string[],
        // TODO: withdrawn
    ) {}
}