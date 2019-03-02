import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  private subscription
  loginForm = this.fb.group({
    username: [''],
    password: ['']
  });

  constructor(private route: ActivatedRoute, private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit() {

  }
  onSubmit() {
    const user: { username: string, password: string } = this.loginForm.value
    this.authService.login(user.username, user.password).subscribe(x => this.authService.Token = x.token);
  }

}
