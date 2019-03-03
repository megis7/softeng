import { Component, OnInit } from '@angular/core';
import { Shop } from '../../../models/shop';
import { ShopService } from '../../../services/shop.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-shops',
	templateUrl: './shops.component.html',
	styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit {

	shops$: Observable<Shop[]>;
	start$: Observable<number>
	total$: Observable<number>
	count$: Observable<number>
	page: number = 0
	pageSize: number = 2;

	constructor(private shopService: ShopService) { }

	ngOnInit() {
		const temp = this.shopService.getShopsPaged(this.page * 1, 1);
		this.shops$ = temp.pipe(map(res => res.shops))
		this.total$ = temp.pipe(map(res => res.total))
		this.count$ = temp.pipe(map(res => res.count))

		// this.shopService.getShops().subscribe(res => this.shops = res, err => console.log(err));
	}

	deleteShop(shop: Shop) {
		this.shopService.deleteShop(shop.id).subscribe(msg => {
			if(msg.message == "OK") this.loadPage(this.page); 
		}, err => console.log(err));
	}

	loadPage(page: number) {
		const temp = this.shopService.getShopsPaged((page - 1) * this.pageSize, this.pageSize);
		this.shops$ = temp.pipe(map(res => res.shops))
		this.total$ = temp.pipe(map(res => res.total))
		this.count$ = temp.pipe(map(res => res.count))
	}
}
