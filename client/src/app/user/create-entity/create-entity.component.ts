import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Shop } from 'src/models/shop';
import { Product } from 'src/models/product';

@Component({
	selector: 'app-create-entity',
	templateUrl: './create-entity.component.html',
	styleUrls: ['./create-entity.component.scss']
})
export class CreateEntityComponent implements OnInit {

	@Input() createProduct = false;
	@Input() createShop = false;

	@Input() activeProduct: Product;
	@Input() activeShop: Shop;
	@Output() creationCompleted = new EventEmitter()

	private state = "";

	constructor() { }

	ngOnInit() {
		if (this.createProduct)	this.updateState("product");
		else if (this.createShop) this.updateState("shop");
	}

	private updateState(newState: string, obj: any = null) {

		this.state = newState;
		if(newState == "finish")
			this.creationCompleted.next()
	}

	get showEditProduct() {
		return this.state == "product";
	}

	get showEditShop() {
		return this.state == "shop";
	}

	get canMoveNext() {
		return this.state != 'shop';
	}

}
