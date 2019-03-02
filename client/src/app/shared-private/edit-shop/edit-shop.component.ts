import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Shop } from '../../../models/shop';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { ShopService } from '../../../services/shop.service';
import { MapComponent } from '../../shared/map/map.component';
import { Point } from '../../../models/point';

@Component({
	selector: 'app-edit-shop',
	templateUrl: './edit-shop.component.html',
	styleUrls: ['./edit-shop.component.scss']
})
export class EditShopComponent implements OnInit, AfterViewInit {

	@ViewChild(MapComponent) mapDisplay;

	private subscription
	@Input() private activeShop: Shop = null;
	shopForm = this.fb.group({
		id: [''],
		name: [''],
		address: [''],
		lat: [''],
		lng: [''],
		tags: this.fb.array([this.fb.control('')])
	});
	private currentLocation: Point = { 'lon': -1, 'lat': -1 };
	constructor(private route: ActivatedRoute, private shopService: ShopService, private fb: FormBuilder) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			const id = params["id"] || "0"

			if (id == "0") {
				this.subscription = (this.activeShop && of(this.activeShop)) || of(new Shop("0", "", "", this.currentLocation.lon, this.currentLocation.lat, []))
			}
			else
				this.subscription = this.shopService.getShop(id)

			this.subscription.subscribe(shop => {
				this.activeShop = shop;
				this.shopForm = this.fb.group({
					id: [this.activeShop.id],
					name: [this.activeShop.name, Validators.required],
					address: [this.activeShop.address, Validators.required],
					lat: [this.activeShop.lat],
					lon: [this.activeShop.lng],
					tags: this.fb.array([])
				});
				if (id == "0") (this.shopForm.get("tags") as FormArray).push(this.fb.control('', Validators.required))
				this.activeShop.tags.forEach(tag => {
					(this.shopForm.get("tags") as FormArray).push(this.fb.control(tag, Validators.required))
				});
			})
		})
	}
	ngAfterViewInit() {
		if (this.activeShop.id != "0"){
			this.mapDisplay.addPoint(new Point(this.activeShop.lng, this.activeShop.lat))
			this.mapDisplay.setPosition(new Point(this.activeShop.lng, this.activeShop.lat))
		}
		else {
			this.getLocation();
		}
	}

	private canGetLocation(): boolean {
		return navigator.geolocation != null;
	}

	private getLocation(): void {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				this.currentLocation.lon = pos.coords.longitude;
				this.currentLocation.lat = pos.coords.latitude;

				this.activeShop.lng = this.currentLocation.lon
				this.activeShop.lat = this.currentLocation.lat

				this.mapDisplay.addPoint(new Point(this.currentLocation.lon, this.currentLocation.lat))
				this.mapDisplay.setPosition(new Point(this.currentLocation.lon, this.currentLocation.lat))
			})
		}
	}

	get name() {
		return this.shopForm.get('name');
	}

	get address() {
		return this.shopForm.get('address');
	}

	get tags() {
		return this.shopForm.get('tags') as FormArray;
	}

	removeTag(i: number) {
		(this.shopForm.get("tags") as FormArray).removeAt(i)
		return false
	}

	addTag() {
		(this.shopForm.get("tags") as FormArray).push(this.fb.control('', Validators.required))
		return false
	}

	onSubmit() {
		const shop = this.shopForm.value
		console.log(shop)
		if (shop.id == "0")
			this.shopService.postShop(shop).subscribe(sho => { this.activeShop = sho; this.shopForm.setValue(this.activeShop) }, err => console.log(err))
		else
			this.shopService.putShop(shop).subscribe(sho => { this.activeShop = sho; this.shopForm.setValue(this.activeShop) }, err => console.log(err))
	}

}
