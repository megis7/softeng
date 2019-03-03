export class PriceResult {
    constructor(
        public price: number,
        public date: Date,
        public productName: string,
        public productId: string,
        public productTags: string[],
        public shopId: string,
        public shopName: string,
        public shopTags: string[],
        public shopAddress: string,
        public shopDist: number,
        public shopLng: number,
        public shopLat: number,
    ){}
}