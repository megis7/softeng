import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/services/product.service';
import { Product } from 'src/models/product';
import { ShopService } from '../services/shop.service';
import { Shop } from '../models/shop';
import { AuthService } from '../services/auth.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(private router: Router, private prodService: ProductService, private shopService: ShopService, private authService: AuthService) { }

	public isActive(route: string): boolean {
		return this.router.url.includes(route);
	}

	test() {
		this.prodService.getProduct('10').subscribe(x => console.log(x));
		this.prodService.getProducts(5,10, 'ALL', 'id|DESC').subscribe(x => console.log(x));
		this.prodService.deleteProduct('10').subscribe(x => console.log(x));
		this.prodService.postProduct(new Product('0', 'asd', 'desc', 'gdf', null)).subscribe(x => console.log(x));
		this.prodService.patchProduct(new Product('0', 'asd', 'desc', 'gdf', null), 'name').subscribe(x => console.log(x));
	}
	test2(){
		this.shopService.getShop('42').subscribe(x => console.log(x));
		this.shopService.getShops().subscribe(x => console.log(x));
		this.shopService.deleteShop('10').subscribe(x => console.log(x));
		this.shopService.postShop(new Shop('0', 'asd', 'desc', 5, 6, ['17','42'])).subscribe(x => console.log(x));
		this.shopService.patchShop(new Shop('0', 'asd', 'desc', 5, 6, ['17','42']), 'tags').subscribe(x => console.log(x));
	}
	test4(){
		this.authService.login("hello","world").subscribe(x => this.authService.Token = x.token);
	}
}
