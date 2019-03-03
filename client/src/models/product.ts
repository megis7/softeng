
export class Product {

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public category: string,
        public tags: string[],
        public withdrawn: boolean = false
    ){}
}