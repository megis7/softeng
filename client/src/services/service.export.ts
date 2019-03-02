import { ProductService } from './product.service';
import { ShopService } from './shop.service';
import { AuthService } from './auth.service';
import { PriceService } from './price.service';
import { GeocodeService } from './geocode.service';

export const SERVICE_PROVIDERS: any[] = [
    ProductService,
    ShopService,
    AuthService,
    PriceService,
    GeocodeService
]