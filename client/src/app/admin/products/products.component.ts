import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss','../../home/home.component.scss']
})
export class ProductsComponent implements OnInit {

	products$: Observable<Product[]>
	start$: Observable<number>
	total: number

	page: number = 1
	pageSize: number = 3;

	constructor(
		private productService: ProductService,
		private toasterService: ToastrService) { }

	ngOnInit() {
		this.loadPage(this.page)
	}

	deleteProduct(product: Product) {
		this.productService.deleteProduct(product.id).subscribe(msg => {
			if(msg.message == "OK") { this.toasterService.success("Ο καφές διαγράφηκε", "Επιτυχία"); this.loadPage(this.page); }
		}, err => { console.log(err); this.toasterService.error("Σφάλμα κατά τη διαγραφή", "Αποτυχία") });
	}

	loadPage(page: number) {
		this.products$ = this.productService.getProductsPaged((page - 1) * this.pageSize, this.pageSize)
											.pipe(
												tap(res => this.total = res.total), 
												map(res => res.products))
	}
}
