import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AccountService } from '../core/services/account.service';

@Injectable()
export class LoginCheckGuardService implements CanActivate {

    constructor(private router: Router, private accountService: AccountService) {
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (!this.accountService.loggedIn()) {
            return true;
        }

        this.router.navigate(['/wallet/transfer']);
    }
}
