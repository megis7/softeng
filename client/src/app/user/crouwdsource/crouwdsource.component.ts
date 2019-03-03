import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MapComponent } from 'src/app/shared/map/map.component';
import { Shop } from 'src/models/shop';
import { ShopService } from 'src/services/shop.service';
import { PriceService } from 'src/services/price.service';
import { ProductService } from 'src/services/product.service';
import { Product } from 'src/models/product';
import { PriceLite } from 'src/models/price';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntityNotFoundComponent } from '../entity-not-found/entity-not-found.component';

@Component({
	selector: 'app-crouwdsource',
	templateUrl: './crouwdsource.component.html',
	styleUrls: ['./crouwdsource.component.scss','../../login/login.component.scss']
})
export class CrouwdsourceComponent implements OnInit {

	// private currentLocation: Point = { 'lon': -1, 'lat': -1 };

	// private getLocation(): void {
	// 	if (navigator.geolocation) {
	// 		navigator.geolocation.getCurrentPosition(pos => {
	// 			this.currentLocation.lon = pos.coords.longitude;
	// 			this.currentLocation.lat = pos.coords.latitude;

	// 			this.handleLocation();
	// 		})
	// 	}
	// }

	private shops: Shop[];
	private products: Product[] = null;

	private shouldCreateEntity = false;
	private productNotFound = false;
	private shopNotFound = false;

	private tempActiveProduct: Product = null;
	private tempActiveShop: Shop = null;

	@ViewChild(MapComponent) mapDisplay;

	priceForm = this.fb.group({
		price: ['', { validators: [Validators.required, this.currencyValidator], updateOn: 'blur' }],
		dateFrom: [new Date()],
		dateTo: [new Date()],
		productName: ['', [Validators.required]],
		productId: [''],
		shopName: ['', Validators.required],
		shopId: ['']
	});

	constructor(
		private fb: FormBuilder, 
		private shopService: ShopService, 
		private productService: ProductService, 
		private priceService: PriceService,
		private modalService: NgbModal) { }

	
	private currencyValidator(control: AbstractControl): { [key: string]: boolean } | null {
		// /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/
		if (control.value !== undefined && control.value.length > 0 && (isNaN(control.value) || /^\d+(\.\d+)?$/.test(control.value) == false)) {
			return { 'price': true };
		}
		return null;
	}

	ngOnInit() {
		// this.getLocation();

		this.shopService.getShops(0, 1000, 'ACTIVE')
			// .subscribe(shops => { this.shops = shops; this.shops.map(s => new Point(s.lng, s.lat)).forEach(x => this.mapDisplay.addPoint(x)) });
			.subscribe(shops => this.shops = shops)

		this.productService.getProducts(0, 1000, 'ACTIVE')
			.subscribe(products => this.products = products)
	}

	// private handleLocation() {

	// 	// set map properties
	// 	// this.mapDisplay.setPosition(this.currentLocation);
	// 	// this.mapDisplay.addPoint(this.currentLocation);

	// }

	get price() { return this.priceForm.get('price'); }
	get product() { return this.priceForm.get('productName'); }
	get shop() { return this.priceForm.get('shopName'); }

	searchProduct = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			map(term => term.length < 2 ? [] : this.products.filter(p => p.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 7).map(p => p.name))
		)

	searchShop = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			map(term => term.length < 2 ? [] : this.shops.filter(p => p.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 7).map(p => p.name))
		)

	onSubmit() {
		const productIndex = this.products.findIndex(p => p.name == this.priceForm.value.productName)	// TODO: What happens if two products share names
		const shopIndex = this.shops.findIndex(s => s.name == this.priceForm.value.shopName)
		const price = this.priceForm.value.price;
		let productFound = true, shopFound = true;

		if (productIndex < 0) {
			//this.product.setErrors({ 'name': true });
			productFound = false;
		}

		if (shopIndex < 0) {
			//this.shop.setErrors({ 'name': true });
			shopFound = false;
		}

		// open a modal to allow user to create shop
		if (productFound == false || shopFound == false) {
			this.productNotFound = !productFound;
			this.shopNotFound = !shopFound;

			this.tempActiveProduct = new Product("0", this.priceForm.value.productName, "", "", []);
			this.tempActiveShop = new Shop("0", this.priceForm.value.shopName, "", 0, 0, []);

			const modalRef = this.modalService.open(EntityNotFoundComponent)
			modalRef.result.then(result => {
				this.shouldCreateEntity = this.processModalResult(result)
			})
			modalRef.componentInstance.productNotFound = this.productNotFound
			modalRef.componentInstance.shopNotFound = this.shopNotFound
			return false;
		}
		else {
			this.productNotFound = this.shopNotFound = false;
			this.tempActiveProduct = this.tempActiveShop = null;
		}

		const newPrice = new PriceLite(price, new Date(), new Date(), this.products[productIndex].id, this.shops[shopIndex].id)

		this.priceService.postPrice(newPrice).subscribe(x => { }, err => console.log(err));
		console.log(newPrice)
	}

	private processModalResult(result): boolean {
		if (result == "close-click" || result == "cross-click") return false;
		else return true;
	}
}
