import { Component, OnInit } from '@angular/core';
import { Shop } from '../../../models/shop';
import { ShopService } from '../../../services/shop.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-shops',
	templateUrl: './shops.component.html',
	styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit {

	shops$: Observable<Shop[]>
	start$: Observable<number>
	total: number = 0

	page: number = 1
	pageSize: number = 3

	constructor(
		private shopService: ShopService,
		private toasterService: ToastrService) { }

	ngOnInit() {
		this.loadPage(this.page);
	}

	deleteShop(shop: Shop) {
		this.shopService.deleteShop(shop.id).subscribe(msg => {
			if(msg.message == "OK") { this.toasterService.success("Το κατάστημα διαγράφηκε", "Επιτυχία"); this.loadPage(this.page); }
		}, err => { console.log(err); this.toasterService.error("Σφάλμα κατά τη διαγραφή", "Αποτυχία") });
	}

	loadPage(page: number) {
		this.shops$ = this.shopService.getShopsPaged((page - 1) * this.pageSize, this.pageSize)
									  .pipe(
										  tap(res => this.total = res.total), 
										  map(res => res.shops))
	}
}
