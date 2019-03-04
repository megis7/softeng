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
import { ToastrService } from 'ngx-toastr';
import { componentNeedsResolution } from '@angular/core/src/metadata/resource_loading';

@Component({
	selector: 'app-crouwdsource',
	templateUrl: './crouwdsource.component.html',
	styleUrls: ['./crouwdsource.component.scss','../../login/login.component.scss','../../home/home.component.scss']
})
export class CrouwdsourceComponent implements OnInit {

	private shops: Shop[];
	private products: Product[] = null;

	shouldCreateEntity = false;
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
		private toasterService: ToastrService,
		private modalService: NgbModal) { }

	
	private currencyValidator(control: AbstractControl): { [key: string]: boolean } | null {
		if (control.value !== undefined && control.value && control.value.length > 0 && (isNaN(control.value) || /^\d+(\.\d+)?$/.test(control.value) == false)) {
			return { 'price': true };
		}
		return null;
	}

	ngOnInit() {
		this.shopService.getShops(0, 1000, 'ACTIVE')
			.subscribe(shops => this.shops = shops)

		this.productService.getProducts(0, 1000, 'ACTIVE')
			.subscribe(products => this.products = products)
	}

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

		this.priceService.postPrice(newPrice)
			.subscribe(x => { this.toasterService.success("Ευχαριστούμε", "Η τιμή καταχωρήθηκε επιτυχώς"); this.priceForm.reset(); },
					 err => { console.log(err); this.toasterService.error("Σφάλμα κατά την υποβολή", "Αποτυχία") });
	}

	private processModalResult(result): boolean {
		if (result == "close-click" || result == "cross-click") return false;
		else return true;
	}

	completeSumission(event: any) {
		this.shouldCreateEntity = false;

		this.shopService.getShops(0, 1000, 'ACTIVE')
			.subscribe(shops => {

				this.shops = shops
				this.productService.getProducts(0, 1000, 'ACTIVE')
				.subscribe(products => {
					this.products = products;

					this.onSubmit();
				})
				
			})
	}
}
