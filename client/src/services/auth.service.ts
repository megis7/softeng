import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Product } from 'src/models/product';
import { environment as env } from '../environments/environment';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthService{

    private url = `${env.baseURL}`;

    constructor(private http: HttpClient){}

    set Token(token: string){
        localStorage.setItem("token",token);
    }

    get Token(): string{
        return localStorage.getItem("token");
    }
    
    get User(): User{
        const tempToken = this.Token;
        if(tempToken == null)return null;
        const newJwthelper = new JwtHelperService;
        const decoded = newJwthelper.decodeToken(tempToken);
        return decoded;
    }

    login(username: string, password: string): Observable<{token: string}>{
        //return this.http.post<{token: string}>(`${this.url}/login`,{username: username, password: password});
        return of({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzY1OGY2MjNlYTU3NTAyM2VmYWVkZWEiLCJ1c2VybmFtZSI6Im1hcmFraSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE1NTAyMjkzMzgsImV4cCI6MTU1MDMxNTczOH0.PNbC9krllp7Ye5D5xRmjn4mGMMMAyH0ZHbW1doA0g1A'});
    }

    logout(): Observable<{messege: string}>{
        const temp = this.http.post<{messege: string}>(`${this.url}/logout`,null);
        localStorage.removeItem("token");
        return temp;
    }

    register(username:string , password:string, role: string): Observable<{messege: string}>{
        //const temp = this.http.post<{messege: string}>(`${this.url}/user`,{username: username, password: password, role: role});
        const temp = of({messege: "ok"})
        return temp;
    }

    isLoggedIn(): boolean{
        return this.Token != null;
    }
}