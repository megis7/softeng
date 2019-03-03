import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

	products$: Observable<Product[]>;
	start$: Observable<number>
	total$: Observable<number>
	count$: Observable<number>
	page: number = 0
	pageSize: number = 2;

	constructor(private productService: ProductService) { }

	ngOnInit() {
		const temp = this.productService.getProductsPaged(this.page * 1, 1);
		this.products$ = temp.pipe(map(res => res.products))
		this.total$ = temp.pipe(map(res => res.total))
		this.count$ = temp.pipe(map(res => res.count))

		// this.productService.getProductsPaged().subscribe(
		// 	res => {
		// 		this.start = res.start
		// 		this.count = res.count
		// 		this.products = res.products},
		// 	err => console.log(err));
	}

	deleteProduct(product: Product) {
		this.productService.deleteProduct(product.id).subscribe(msg => {
			if(msg.message == "OK") this.loadPage(this.page)
		}, err => console.log(err));
	}

	loadPage(page: number) {
		const temp = this.productService.getProductsPaged((page - 1) * this.pageSize, this.pageSize);
		this.products$ = temp.pipe(map(res => res.products))
		this.total$ = temp.pipe(map(res => res.total))
		this.count$ = temp.pipe(map(res => res.count))
	}
}
