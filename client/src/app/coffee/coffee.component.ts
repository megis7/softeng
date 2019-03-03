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

@Component({
	selector: 'app-coffee',
	templateUrl: './coffee.component.html',
	styleUrls: ['./coffee.component.scss']
})
export class CoffeeComponent implements OnInit {

	private currentLocation: Point = { 'lon': -1, 'lat': -1 };
	private prices: PriceResult[];
	private availableProducts: Product[];
	public showAdvancedSearch = false;
	public showForm = true;
	public showMapEdit = false;

	private coffeeForm = this.fb.group({
		address: [''],
		coffee: [''],
		maxDistance: [1],
		maxPrice: [2],
		addressCopy: [null]
	});

	@ViewChild(MapComponent) mapDisplay;

	constructor(
		private priceService: PriceService,
		private fb: FormBuilder,
		private geocodeService: GeocodeService,
		private productService: ProductService) { }

	ngOnInit() {
		this.productService.getProducts(0, 1000)
			.subscribe(res => this.availableProducts = res)

		this.coffeeForm.valueChanges.pipe(debounceTime(200)).subscribe(value => this.processFormChange())

		if (navigator.geolocation != null)
			this.getLocation();
	}

	processFormChange(): void {
		// TODO: after filtering, set points on map
		// this.prices.filter(p => p.productName.indexOf(this.coffeeForm.value.coffee) >= 0)
		// 	.filter(p => p.shopDist < +this.coffeeForm.value.maxDistance)
		// 	.filter(p => p.price < this.coffeeForm.value.maxPrice);

		if(this.coffeeForm.value.address.trim() != '')
			this.showMapEdit = true;
		else {
			this.showMapEdit = false;
			this.clearEditMap();
		}

		// fix address and geocode
		if (this.coffeeForm.value.address == this.coffeeForm.value.addressCopy)
			return;

		this.coffeeForm.get('addressCopy').setValue(this.coffeeForm.value.address);

		this.geocodeService.geocode(this.coffeeForm.value.address)
			.subscribe(
				l => {
					this.getPricesForLocation(this.currentLocation);
					this.mapDisplay.removeAllPoints();
					this.mapDisplay.addPoint(l[0]);
					this.mapDisplay.setPosition(l[0]);
					this.mapDisplay.setZoom(env.mapZoomed);
					// this.updateShopCoords(l[0]);
					// this.showMapHelp = true;
				}
				, err => console.log(err));
	}

	private getLocation(): void {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				this.currentLocation.lon = pos.coords.longitude;
				this.currentLocation.lat = pos.coords.latitude;

				this.mapDisplay.addPoint(this.currentLocation);
				this.mapDisplay.setPosition(this.currentLocation);
				this.mapDisplay.setZoom(env.mapZoomed);

				this.geocodeService.reverseGeocode(this.currentLocation).subscribe(x => {
					this.coffeeForm.get("address").setValue(x[0])
					this.coffeeForm.get("addressCopy").setValue(x[0])
				})

				this.getPricesForLocation(this.currentLocation);
			})
		}
	}

	private getPricesForLocation(location: Point) {
		this.priceService.getPrices(0, 1000, 1, location.lon, location.lat, new Date(), new Date()).subscribe(x => this.prices = x, err => console.log(err))
	}

	public allowEditMap() {
		this.mapDisplay.setClickable(true);
	}

	public clearEditMap() {
		this.mapDisplay.setClickable(false);
	}

	onSearchChange(searchValue: string) {
		// this.prices.filter(p => p.productName.indexOf(searchValue) >= 0)

		this.mapDisplay.removeAllPoints();
		this.mapDisplay.addPoint(this.currentLocation);
	}


	availableProducts$ = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(100),
			distinctUntilChanged(),
			map(term => term.length < 1 ? [] : this.availableProducts.filter(p => p.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 7).map(p => p.name))
		)
}
