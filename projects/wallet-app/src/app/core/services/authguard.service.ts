import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AccountService } from './account.service';

@Injectable()

export class AuthguardService implements CanActivate, CanActivateChild {
    constructor(private router: Router,
                private accountService: AccountService) {
    }

    canActivate(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.accountService.loggedIn()) {
                resolve(true);
                return;
            }

            resolve(false);
            this.router.navigate(['/']);

        });

    }

    canActivateChild(): Promise<boolean> {
        return this.canActivate();
    }
}
