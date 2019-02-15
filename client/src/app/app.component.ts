import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/services/product.service';
import { Product } from 'src/models/product';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(private router: Router, private prodService: ProductService) { }

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
}
