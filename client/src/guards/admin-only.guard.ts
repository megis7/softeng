import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AdminOnlyGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {

        if (this.authService.isAdmin()) {
            return true;
        }
        else {
            return this.router.navigate(['/unauthorized']);
        }
    }
}
