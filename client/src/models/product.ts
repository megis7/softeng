
export class Product {

    constructor(
        public _id: string,
        public name: string,
        public description: string,
        public category: string,
        public tags: string[]
        // TODO: withdrawn
    ){}
}