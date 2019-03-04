import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { Shop } from '../../../models/shop';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { ShopService } from '../../../services/shop.service';
import { MapComponent } from '../../shared/map/map.component';
import { Point } from '../../../models/point';
import { GeocodeService } from 'src/services/geocode.service';
import { environment as env } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs/operators';

@Component({
	selector: 'shared-edit-shop',
	templateUrl: './edit-shop.component.html',
	styleUrls: ['./edit-shop.component.scss']
})
export class EditShopComponent implements OnInit, AfterViewInit {

	@Input() mapDisplay;
	@Input() private activeShop: Shop = null;
	@Input() private isMap: boolean = true;
	@Output() private formSubmitted = new EventEmitter<Shop>()
	private subscription;
	private showMapHelp = false;
	private mapClickedSubscription;

	shopForm = this.fb.group({
		id: [''],
		name: [''],
		address: [''],
		lat: [''],
		lng: [''],
		tags: this.fb.array([this.fb.control('')])
	});

	constructor(
		private route: ActivatedRoute,
		private shopService: ShopService,
		private geocodeService: GeocodeService,
		private fb: FormBuilder,
		private toasterService: ToastrService) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			const id = params["id"] || "0"

			if (id == "0") {
				this.subscription = (this.activeShop && of(this.activeShop)) || of(new Shop("0", "", "", -1, -1, []))
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
					lng: [this.activeShop.lng],
					tags: this.fb.array([]),
					withdrawn: ['']
				});
				
				this.activeShop.tags.forEach(tag => {
					(this.shopForm.get("tags") as FormArray).push(this.fb.control(tag, Validators.required))
				});

				this.shopForm.valueChanges
					.pipe(debounceTime(300))
					.subscribe(value => this.processFormChange(value))

				this.mapClickedSubscription = this.geocodeService.mapClicked().subscribe(pos => this.updateShopCoords(pos))
			})
		})
	}

	private processFormChange(value) {

	}

	ngAfterViewInit() {
		if (this.activeShop.id != "0"){
			this.mapDisplay.addPoint(new Point(this.activeShop.lng, this.activeShop.lat))
			this.mapDisplay.setPosition(new Point(this.activeShop.lng, this.activeShop.lat))
			this.mapDisplay.setZoom(env.mapZoomed);
		}
	}

	public addressLostFocus() {
		this.geocodeService.geocode(this.shopForm.value.address)
						   .subscribe(
							l => { 
									this.mapDisplay.removeAllPoints();
									this.mapDisplay.addPoint(l[0]);
									this.mapDisplay.setPosition(l[0]);
									this.mapDisplay.setZoom(env.mapZoomed);
									this.mapDisplay.setClickable(true);
									this.updateShopCoords(l[0]);
									this.showMapHelp = true;
							}
							,err => console.log(err));
	}

	public updateShopCoords(evt: Point) {
		this.shopForm.get('lng').setValue(evt.lon)
		this.shopForm.get('lat').setValue(evt.lat)
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

		if (shop.id == "0")
			this.shopService.postShop(shop).subscribe(sho => {
				this.activeShop = sho; 
				this.shopForm.setValue(this.activeShop); 
				this.formSubmitted.next(sho);

				// this.shopForm.reset();
				this.toasterService.success("Το κατάστημα δημιουργήθηκε", "Επιτυχία")
				
			}, err => { console.warn(err); this.toasterService.error("Σφάλμα κατά τη δημιουργία", "Αποτυχία") })
		else
			this.shopService.putShop(shop).subscribe(sho => {
				this.activeShop = sho; 
				this.shopForm.setValue(this.activeShop); 
				this.formSubmitted.next(sho);

				this.toasterService.success("Το κατάστημα ανανεώθηκε", "Επιτυχία")
				
			}, err => { console.warn(err); this.toasterService.error("Σφάλμα κατά την ανανέωση", "Αποτυχία") })
	}

}
