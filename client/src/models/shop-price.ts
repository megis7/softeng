export class ShopPrice {
    constructor(
        public type: string,
        public price: number,
        public productName: string,
        public productId: string,
        public shopId: string,
        public shopName: string,
        public shopAddress: string,
        public shopDist: number,
        public shopLng: number,
        public shopLat: number
    ){}
}