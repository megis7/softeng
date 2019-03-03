import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MapComponent } from 'src/app/shared/map/map.component';
import { Point } from 'src/models/point';
import { Shop } from 'src/models/shop';
import { ShopService } from 'src/services/shop.service';
import { PriceService } from 'src/services/price.service';
import { ProductService } from 'src/services/product.service';
import { Product } from 'src/models/product';
import { PriceLite } from 'src/models/price';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-edit-price',
	templateUrl: './edit-price.component.html',
	styleUrls: ['./edit-price.component.scss']
})
export class EditPriceComponent implements OnInit {

	private shops: Shop[];
	private products: Product[] = null;
	private activeProduct: Product;
	private productFlag: Boolean = false;
	private activeShop: Shop;
	private shopFlag: boolean = false;

	hoveredDate: NgbDate;

	@ViewChild(MapComponent) mapDisplay;

	constructor(
		private fb: FormBuilder,
		private shopService: ShopService,
		private productService: ProductService,
		private priceService: PriceService,
		private calendar: NgbCalendar) { }

	priceForm = this.fb.group({
		price: ['', { validators: [Validators.required, this.currencyValidator], updateOn: 'blur' }],
		dateFrom: [null],
		dateTo: [null],
		product: ['',Validators.required],
		shop: ['',Validators.required]
	});

	private currencyValidator(control: AbstractControl): { [key: string]: boolean } | null {
		// /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/
		if (control.value !== undefined && control.value.length > 0 && (isNaN(control.value) || /^\d+(\.\d+)?$/.test(control.value) == false)) {
			return { 'price': true };
		}
		return null;
	}

	private formatDate(date: NgbDate) {
		return new Date([date.year, date.month, date.day].join('-'));
	}

	get product(){
		return this.priceForm.get("product")
	}
	get shop(){
		return this.priceForm.get("shop")
	}

	ngOnInit() {
		// this.getLocation();

		this.shopService.getShops(0, 1000, 'ACTIVE')
			// .subscribe(shops => { this.shops = shops; this.shops.map(s => new Point(s.lng, s.lat)).forEach(x => this.mapDisplay.addPoint(x)) });
			.subscribe(shops => this.shops = shops)

		this.productService.getProducts(0, 1000, 'ACTIVE')
			.subscribe(products => this.products = products)

		this.priceForm = this.fb.group({
			price: ['', { validators: [Validators.required, this.currencyValidator], updateOn: 'blur' }],
			dateFrom: [this.calendar.getToday()],
			dateTo: [this.calendar.getToday()],
		});

		// this.loadPageProduct(1)

		// this.loadPageShop(1)

	}

	get price() { return this.priceForm.get('price'); }

	productSelection(product: Product) {
		this.activeProduct = product
		this.productFlag = true;
	}

	selectedProduct(product: Product): boolean {
		return product == this.activeProduct
	}

	shopSelection(shop: Shop) {
		this.activeShop = shop
		this.shopFlag = true;
	}

	selectedShop(shop: Shop): boolean {
		return shop == this.activeShop
	}

	onSubmit() {
		const price = this.priceForm.value.price;
		const dateFrom = this.formatDate(this.priceForm.value.dateFrom); 
		const dateTo = this.formatDate(this.priceForm.value.dateTo);
		const productIndex = this.products.findIndex(p => p.name == this.priceForm.value.productName)
		const shopIndex = this.shops.findIndex(s => s.name == this.priceForm.value.shopName)
		let productFound = true, shopFound = true;

		if (productIndex < 0) {
			this.product.setErrors({ 'name': true });
			productFound = false;
		}

		if (shopIndex < 0) {
			this.shop.setErrors({ 'name': true });
			shopFound = false;
		}

		if (productFound == false || shopFound == false)return false;

		const newPrice = new PriceLite(price, dateFrom, dateTo, this.activeProduct.id, this.activeShop.id)

		this.priceService.postPrice(newPrice).subscribe(x => { }, err => console.log(err));
		console.log(newPrice)
	}

	//* Datepicker functions

	isHovered(date: NgbDate) {
		let fromDate = this.priceForm.value.dateFrom;
		let toDate = this.priceForm.value.dateTo;
		return fromDate && !toDate && this.hoveredDate && date.after(fromDate) && date.before(this.hoveredDate);
	}

	isInside(date: NgbDate) {
		let fromDate = this.priceForm.value.dateFrom;
		let toDate = this.priceForm.value.dateTo;
		return date.after(fromDate) && date.before(toDate);
	}

	isRange(date: NgbDate) {
		let fromDate = this.priceForm.value.dateFrom;
		let toDate = this.priceForm.value.dateTo;
		return date.equals(fromDate) || date.equals(toDate) || this.isInside(date) || this.isHovered(date);
	}

	onDateSelection(date: NgbDate) {
		let fromDate = this.priceForm.value.dateFrom;
		let toDate = this.priceForm.value.dateTo;

		if (!fromDate && !toDate) {
			this.priceForm.get('dateFrom').setValue(date)
		} else if (fromDate && !toDate && date.after(fromDate) || date.equals(fromDate)) {
			this.priceForm.get('dateTo').setValue(date)
		} else {
			this.priceForm.get('dateTo').setValue(null)
			this.priceForm.get('dateFrom').setValue(date)
			fromDate = date;
		}
	}

	// products$: Observable<Product[]>;
	// startProd$: Observable<number>
	// totalProd$: Observable<number>
	// countProd$: Observable<number>
	// pageProd: number = 0
	// pageSizeProd: number = 2;

	// shops$: Observable<Shop[]>;
	// startSho$: Observable<number>
	// totalSho$: Observable<number>
	// countSho$: Observable<number>
	// pageSho: number = 0
	// pageSizeSho: number = 2;

	// loadPageProduct(page: number) {
	// 	const temp = this.productService.getProductsPaged((page-1) * this.pageSizeProd, this.pageSizeProd);
	// 	this.products$ = temp.pipe(map(res => res.products))
	// 	this.totalProd$ = temp.pipe(map(res => res.total))
	// 	this.countProd$ = temp.pipe(map(res => res.count))
	// }
	// loadPageShop(page: number) {
	// 	const temp = this.shopService.getShopsPaged((page - 1) * this.pageSizeSho, this.pageSizeSho);
	// 	this.shops$ = temp.pipe(map(res => res.shops))
	// 	this.totalSho$ = temp.pipe(map(res => res.total))
	// 	this.countSho$ = temp.pipe(map(res => res.count))
	//}

}
