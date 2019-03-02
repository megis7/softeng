import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent {

	loginForm = this.fb.group({
		username: [''],
		password: ['']
	});

	constructor(
		private router: Router, 
		private authService: AuthService, 
		private fb: FormBuilder) { }

	onSubmit() {
		const user: { username: string, password: string } = this.loginForm.value
		this.authService.login(user.username, user.password).subscribe(x => { this.authService.Token = x.token; this.router.navigate(["/"]) });
	}

}
