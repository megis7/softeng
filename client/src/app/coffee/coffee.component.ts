import { Component, OnInit, ViewChild } from '@angular/core';
import { Point } from 'src/models/point';
import { MapComponent } from '../shared/map/map.component';
import { PriceService } from 'src/services/price.service';
import { PriceResult } from 'src/models/price-result';
import { FormBuilder } from '@angular/forms';
import { GeocodeService } from 'src/services/geocode.service';

@Component({
	selector: 'app-coffee',
	templateUrl: './coffee.component.html',
	styleUrls: ['./coffee.component.scss']
})
export class CoffeeComponent implements OnInit {

	private currentLocation: Point= { 'lon': -1, 'lat': -1 };
	private prices: PriceResult[];

	private coffeeForm = this.fb.group({
		address: ['']
	});

	@ViewChild(MapComponent) mapDisplay;

	constructor(private priceService: PriceService, private fb: FormBuilder, private geoservice: GeocodeService) { }

	ngOnInit() {
		this.getLocation();
	}

	add() {
		console.log(this.currentLocation);
		this.mapDisplay.addPoint(this.currentLocation);
	}

	private canGetLocation(): boolean {
		return navigator.geolocation != null;
	}

	private getLocation(): void {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				this.currentLocation.lon = pos.coords.longitude;
				this.currentLocation.lat =  pos.coords.latitude;
				this.add();
				this.geoservice.reverseGeocode(this.currentLocation).subscribe(x => {this.coffeeForm.get("address").setValue(x[0])})
				this.priceService.getPrices(0,1000,1,this.currentLocation.lon,this.currentLocation.lat,new Date(), new Date()).subscribe(x => {
					this.prices = x;//get shops
					this.prices.forEach(price => {
						this.mapDisplay.addPoint(new Point(price.shopLng,price.shopLat));
					});
				},err => console.log(err))
			})
		}
	}

}
