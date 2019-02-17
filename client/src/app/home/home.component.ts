import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	constructor(private router: Router) { }

	Hovering: boolean = false;
	mouseEnter(): void{
		this.Hovering = true;
	 }
  
	mouseLeave(): void{
		this.Hovering = false;
	}

	ngOnInit() {
	}
}
