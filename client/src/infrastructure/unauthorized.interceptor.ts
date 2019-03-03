import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService, private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(tap(
            (event: HttpEvent<any>) => { },
            err => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 400) {
                        this.router.navigate(['/unauthorized']);
                    }
                    if (err.status === 401) {
                        this.router.navigate(['/unauthorized']);
                    }
                    if (err.status === 403) {
                        this.router.navigate(['/unauthorized']);
                    }
                    if (err.status === 404) {
                        this.router.navigate(['/notfound']);
                    }
                }
            }));
    }
}