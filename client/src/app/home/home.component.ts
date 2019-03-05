import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	constructor(private router: Router, public authService: AuthService) { }

	Hovering: boolean = false;
	Hovering1: boolean = false;
	mouseEnter(): void{
		this.Hovering = true;
	 }
  
	mouseLeave(): void{
		this.Hovering = false;
	}
	mouseEnter1(): void{
		this.Hovering1 = true;
	 }
  
	mouseLeave1(): void{
		this.Hovering1 = false;
	}

	ngOnInit() {
	}
}
