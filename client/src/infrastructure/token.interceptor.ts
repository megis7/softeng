import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/services/auth.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // console.log(req)

        // TODO: fix register url
        if (this.authService.isLoggedIn() && req.method != "GET" && req.url != "register") {
            req = req.clone({
                setHeaders: {
                    "X-OBSERVATORY-AUTH": this.authService.Token
                }
            })
        }

        return next.handle(req);
    }

}