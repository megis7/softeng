import { ProductService } from './product.service';
import { ShopService } from './shop.service';
import { AuthService } from './auth.service';

export const SERVICE_PROVIDERS: any[] = [
    ProductService,ShopService,AuthService
]