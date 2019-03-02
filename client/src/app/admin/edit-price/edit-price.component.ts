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

	@ViewChild(MapComponent) mapDisplay;

	constructor(private fb: FormBuilder, private shopService: ShopService, private productService: ProductService, private priceService: PriceService) { }

	priceForm = this.fb.group({
		price: ['', {validators: [Validators.required, this.currencyValidator], updateOn: 'blur'}],
		dateFrom: [new Date()],
		dateTo: [new Date()],
	  });

	private currencyValidator(control: AbstractControl): { [key: string]: boolean } | null {
		// /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/
		if (control.value !== undefined && control.value.length > 0 && (isNaN(control.value) ||/^\d+(\.\d+)?$/.test(control.value) == false)) {
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

  get price() { return this.priceForm.get('price'); }
  
  productSelection(product: Product){
    this.activeProduct = product
    this.productFlag = true;
  }

  selectedProduct(product: Product):boolean{
    return product == this.activeProduct
  }

	shopSelection(shop: Shop){
    this.activeShop = shop
    this.shopFlag = true;
  }

  selectedShop(shop: Shop):boolean{
    return shop == this.activeShop
  }
  
	onSubmit() {
		const price = this.priceForm.value.price;

		const newPrice = new PriceLite(price, new Date(), new Date(), this.activeProduct.id, this.activeShop.id)

		this.priceService.postPrice(newPrice).subscribe(x => {}, err => console.log(err));
		console.log(newPrice)
	}

}
