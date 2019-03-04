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
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-edit-price',
	templateUrl: './edit-price.component.html',
	styleUrls: ['./edit-price.component.scss','../../home/home.component.scss']
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
		private toasterService: ToastrService,
		private calendar: NgbCalendar) { }

	priceForm = this.fb.group({
		price: ['', { validators: [Validators.required, this.currencyValidator], updateOn: 'blur' }],
		dateFrom: [null],
		dateTo: [null],
		product: ['',Validators.required],
		shop: ['',Validators.required]
	});

	private currencyValidator(control: AbstractControl): { [key: string]: boolean } | null {
		if (control.value !== undefined && control.value != null && control.value.length > 0 && (isNaN(control.value) || /^\d+(\.\d+)?$/.test(control.value) == false)) {
			return { 'price': true };
		}
		return null;
	}

	private formatDate(date: NgbDate) {
		return new Date([date.year, date.month, date.day].join('-'));
	}

	public get product(){
		return this.priceForm.get("product");
	}
	public get shop(){
		return this.priceForm.get("shop");
	}

	ngOnInit() {

		this.shopService.getShops(0, 1000, 'ACTIVE')
			.subscribe(shops => {this.shops = shops; console.log(shops)})

		this.productService.getProducts(0, 1000, 'ACTIVE')
			.subscribe(products => this.products = products)

		this.priceForm = this.fb.group({
			price: ['', { validators: [Validators.required, this.currencyValidator], updateOn: 'blur' }],
			dateFrom: [],
			dateTo: [],
			product: ['',Validators.required],
			shop: ['',Validators.required]
		});

	}

	public get price() { return this.priceForm.get('price'); }

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
		const productIndex = this.products.findIndex(p => p.name == this.priceForm.value.product)
		const shopIndex = this.shops.findIndex(s => s.name == this.priceForm.value.shop)
		let productFound = true, shopFound = true;

		if (productIndex < 0) {
			this.product.setErrors({ 'product': true });
			productFound = false;
		}

		if (shopIndex < 0) {
			this.shop.setErrors({ 'shop': true });
			shopFound = false;
		}

		if (productFound == false || shopFound == false)
			return false;

		const newPrice = new PriceLite(price, dateFrom, dateTo, this.products[productIndex].id, this.shops[shopIndex].id)

		this.priceService.postPrice(newPrice).subscribe(x => { 
			this.toasterService.success("Η τιμή υποβλήθηκε", "Επιτυχία"); 
			this.priceForm.reset(); 
		}, err => { console.warn(err); this.toasterService.error("Σφάλμα κατά την υποβολή", "Αποτυχία"); });
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
}
