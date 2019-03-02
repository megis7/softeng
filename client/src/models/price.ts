
export class PriceLite {
    constructor(
        public price: number,
        public dateFrom: Date,
        public dateTo: Date,
        public productId: string,
        public shopId: string
    ){}
}