import { Component, OnInit, ViewChild } from '@angular/core';
import { Point } from 'src/models/point';
import { MapComponent } from '../shared/map/map.component';

@Component({
	selector: 'app-coffee',
	templateUrl: './coffee.component.html',
	styleUrls: ['./coffee.component.scss']
})
export class CoffeeComponent implements OnInit {

	private currentLocation: Point= { 'lon': -1, 'lat': -1 };

	@ViewChild(MapComponent) mapDisplay;

	constructor() { }

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
			})
		}
	}

}
