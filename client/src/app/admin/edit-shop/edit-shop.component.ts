import { Component, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from 'src/app/shared/map/map.component';

@Component({
	selector: 'admin-edit-shop',
	templateUrl: './edit-shop.component.html',
	styleUrls: ['./edit-shop.component.scss']
})
export class EditShopComponent implements OnInit {

	@ViewChild(MapComponent) mapDisplay;

	constructor() { }

	ngOnInit() {
	}

}
