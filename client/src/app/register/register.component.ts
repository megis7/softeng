import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder,FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  private subscription
  registerForm = this.fb.group({
    username: ['',Validators.required],
    password1: ['',Validators.required],
    password2: ['',{Validators:[Validators.required, this.passwordValidator], updateOn: 'blur'}],
    role: ["volunteer"]
  });

  get password2(){
    return this.registerForm.get("password2")
  }
  get password1(){
    return this.registerForm.get("password1")
  }

  constructor(private route: ActivatedRoute, private authService: AuthService, private fb: FormBuilder) { }

  private passwordValidator(password1: AbstractControl): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        if (control.value !== undefined && control.value != password1.value) {
            return { 'name': true };
        }
        return null;
    };
  }

  onSubmit() {
    const user: { username: string, password1: string , password2: string, role: string} = this.registerForm.value
    console.log(user.role)
  }

}
