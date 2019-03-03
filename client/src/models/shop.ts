
export class Shop {
    constructor(
        public id: string,
        public name: string,
        public address: string,
        public lng: number,
        public lat: number,
        public tags: string[],
        public withdrawn: boolean = false
    ) {}
}