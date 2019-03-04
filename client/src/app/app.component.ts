import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/services/product.service';
import { Product } from 'src/models/product';
import { ShopService } from '../services/shop.service';
import { Shop } from '../models/shop';
import { AuthService } from '../services/auth.service';
import { PriceService } from '../services/price.service';
import { GeocodeService } from 'src/services/geocode.service';
import { Point } from 'src/models/point';
import { ToastrService } from 'ngx-toastr';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(private router: Router, private prodService: ProductService, private geocodeService: GeocodeService, private toasterService: ToastrService,
		private shopService: ShopService, public authService: AuthService, private priceService: PriceService) { }

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
	test5(){
		// this.priceService.getPrices().subscribe(x => console.log(x));
		// this.priceService.getPrices(2,3,3.14).subscribe(x => console.log(x));
		// this.priceService.getPrices(2,3,3.14,3.45,21.56).subscribe(x => console.log(x));
		// this.priceService.getPrices(2,3,3.14,3.45,21.56,new Date(2019,2,23),new Date(2019,2,24)).subscribe(x => console.log(x));
		// this.priceService.getPrices(2,3,3.14,3.45,21.56,new Date(2019,2,23),new Date(2019,2,24),["1","2","3"],null,["diaskedastiko!"]).subscribe(x => console.log(x));
		// this.priceService.postPrice(new PriceLite(1.56,new Date(), new Date(), "2","3")).subscribe(x => console.log(x));

		// this.geocodeService.reverseGeocode(new Point(23.710409, 37.913213)).subscribe(x => console.log(x));
		// this.toasterService.success("Ο καφές δημιουργήθηκε", "Επιτυχία")
		// this.toasterService.error("Σφάλμα δημιουργίας", "Αποτυχία")
		// this.toasterService.info("Καποια ενεργεια", "Ενημέρωση")
	}
}

// "start": "ng serve --ssl --ssl-key ~/server.key --ssl-cert ~/server.crt --proxy-config proxy.conf.json",
