import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-entity-not-found',
	templateUrl: './entity-not-found.component.html',
	styleUrls: ['./entity-not-found.component.scss']
})
export class EntityNotFoundComponent implements OnInit {

	@Input() productNotFound: boolean = false;
	@Input() shopNotFound: boolean = false;

	constructor(public activeModal: NgbActiveModal) { }

	ngOnInit() {
	}

	

}
