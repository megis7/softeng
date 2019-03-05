import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PriceService } from '../services/price.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(
		private router: Router, 
		public authService: AuthService) { }

	public isActive(route: string): boolean {
		return this.router.url.includes(route);
	}
}