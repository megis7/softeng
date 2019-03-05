import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class CrouwdsourcerOnlyGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {

        if (this.authService.isLoggedIn()) {
            return true;
        }
        else {
            return this.router.navigate(['/unauthorized']);
        }
    }
}
