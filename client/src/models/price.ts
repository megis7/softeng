
export class PriceLite {
    constructor(
        public price: number,
        public dateFrom: Date | string,
        public dateTo: Date | string,
        public productId: string,
        public shopId: string
    ){}
}