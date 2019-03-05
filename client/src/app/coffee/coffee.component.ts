import { Component, OnInit, ViewChild } from '@angular/core';
import { Point } from 'src/models/point';
import { MapComponent } from '../shared/map/map.component';
import { PriceService } from 'src/services/price.service';
import { PriceResult } from 'src/models/price-result';
import { FormBuilder } from '@angular/forms';
import { GeocodeService } from 'src/services/geocode.service';
import { environment as env } from '../../environments/environment'
import { ProductService } from 'src/services/product.service';
import { Product } from 'src/models/product';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ShopPrice } from 'src/models/shop-price';

@Component({
	selector: 'app-coffee',
	templateUrl: './coffee.component.html',
	styleUrls: ['./coffee.component.scss']
})
export class CoffeeComponent implements OnInit {

	private currentLocation: Point = { 'lon': -1, 'lat': -1 };
	private prices: PriceResult[];
	public activePrices: PriceResult[];
	private availableProducts: Product[];
	private maxDistance = 5;
	private maxPrice = 10;
	public showAdvancedSearch = false;
	public showShopDetails = false;
	public showForm = true;
	public showMapEdit = false;
	public showCharts = false;

	public acitveShopPrice: { shopId: string, shopName: string, shopAddress: string, shopDist: number, products: { productName: string, price: number, date: Date }[], location: Point } = null;

	public coffeeShopLocations = new Array<ShopPrice>();

	private geolocationInitialized = false;

	public coffeeForm = this.fb.group({
		address: [''],
		coffee: [''],
		maxDistance: [1],
		maxPrice: [2],
	});

	private addressOld: string = null;

	private DISTANCE_MULTIPLIER = 5
	private PRICE_MULTIPLIER = 10

	@ViewChild(MapComponent) mapDisplay;

	constructor(
		private router: Router,
		private priceService: PriceService,
		private fb: FormBuilder,
		private geocodeService: GeocodeService,
		private productService: ProductService) { }

	ngOnInit() {
		this.productService.getProducts(0, 1000)
			.subscribe(res => this.availableProducts = res)

		this.coffeeForm.valueChanges
			.pipe(debounceTime(300))
			.subscribe(value => this.processFormChange(value))

		if (navigator.geolocation != null)
			this.getInitialLocation();
	}

	processFormCoffeeAndFilters(value) {
		if (value == null)
			value = this.coffeeForm.value;

		let newPrices = this.prices;

		if (value.coffee.trim().length != 0) {
			newPrices = newPrices.filter(p => p.productName.toLowerCase().indexOf(value.coffee) >= 0)
		}

		newPrices = newPrices.filter(p => p.shopDist < +value.maxDistance * this.DISTANCE_MULTIPLIER)
			.filter(p => p.price < +value.maxPrice * this.PRICE_MULTIPLIER);

		this.coffeeShopLocations.length = 0
		this.activePrices = newPrices;

		const shopPrices = this.activePrices.map(p => new ShopPrice('shop', p.price, p.date, p.productName, p.productId, p.shopId, p.shopName, p.shopAddress, p.shopDist, p.shopLng, p.shopLat));

		shopPrices.forEach(e => this.coffeeShopLocations.push(e))
		this.coffeeShopLocations.push(new ShopPrice('home', -1, null, null, null, null, null, null, 0, this.currentLocation.lon, this.currentLocation.lat))

		if (this.acitveShopPrice != null && shopPrices.some(p => p.shopId == this.acitveShopPrice.shopId) == false) {
			this.showShopDetails = false;
			this.acitveShopPrice = null;
		}

	}

	// must be called with proper currentLocation
	getPricesAndUpdateMap() {
		this.priceService.getPrices(0, 1000, this.maxDistance * this.DISTANCE_MULTIPLIER, this.currentLocation.lon, this.currentLocation.lat, new Date(2000, 1, 1), new Date(2100, 1, 1))
			.subscribe(prices => {
				this.prices = prices
				this.processFormCoffeeAndFilters(null);

				this.mapDisplay.setPosition(this.currentLocation)
				this.mapDisplay.setZoom(env.mapZoomed)
			})
	}

	processFormChange(value): void {

		// address field has changed => flush all prices and re-evaluate
		if (value.address != this.addressOld) {
			if (this.geolocationInitialized == false) {
				this.geocodeService.geocode(value.address as string).subscribe(x => {
					this.currentLocation = x[0];
					// TODO: Set location to currentLocation
					this.getPricesAndUpdateMap();
				})
			} else {
				// this is when for the first time browser gps is used
				this.geolocationInitialized = false;
				this.getPricesAndUpdateMap();
			}
			this.addressOld = value.address
		}
		else {
			this.processFormCoffeeAndFilters(value);
		}
	}

	private getInitialLocation(): void {
		navigator.geolocation.getCurrentPosition(pos => {
			this.currentLocation = new Point(pos.coords.longitude, pos.coords.latitude)

			this.geocodeService.reverseGeocode(this.currentLocation).subscribe(x => {
				this.geolocationInitialized = true;
				this.coffeeForm.get("address").setValue(x[0])
			})
		})
	}

	public allowEditMap() {
		this.mapDisplay.setClickable(true);
		return false;
	}

	public clearEditMap() {
		this.mapDisplay.setClickable(false);
	}

	public refocusMapSelf() {
		this.mapDisplay.setPosition(this.currentLocation);
		this.mapDisplay.setZoom(env.mapZoomed)
	}

	public refocusMapGreece() {
		this.mapDisplay.setPosition(env.mapDefaultPosition);
		this.mapDisplay.setZoom(env.mapDefaultZoom)
	}

	public focusOnActiveShop() {
		this.mapDisplay.setPosition(this.acitveShopPrice.location);
		this.mapDisplay.setZoom(env.mapZoomed);
	}

	public gotoCharts() {
		localStorage.setItem('prices', JSON.stringify(this.activePrices));
		this.router.navigate(['/charts']);
	}

	public closeShopDetails() {
		this.showShopDetails = false;
		this.acitveShopPrice = null;
	}

	shopClicked(shops: ShopPrice[]) {
		if (shops.filter(s => s.type != 'home').length == 0)
			return;

		const distinctProducts = Array.from(new Set(shops.map((item: ShopPrice) => item.productName)))

		const interestingProducts = distinctProducts.map(pName => shops.filter(p => p.productName == pName))
		const temp = interestingProducts.map(p => p.sort((a, b) => a.date < b.date ? 1 : -1)[0])

		this.acitveShopPrice = {
			shopId: shops[0].shopId,
			shopName: shops[0].shopName,
			shopAddress: shops[0].shopAddress,
			shopDist: shops[0].shopDist,
			location: new Point(shops[0].shopLng, shops[0].shopLat),
			products: temp.map(p => { return { productName: p.productName, price: p.price, date: new Date(p.date) } })
		}
		this.showShopDetails = true;
	}

	onSearchChange(searchValue: string) {
		
	}


	availableProducts$ = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(100),
			distinctUntilChanged(),
			map(term => term.length < 1 ? [] : this.availableProducts.filter(p => p.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 7).map(p => p.name))
		)
}
