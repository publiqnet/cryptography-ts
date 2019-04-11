/**
 * Created by vaz on 9/22/17.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Account } from './account';
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
    selector: 'app-account-component',
    templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {

    paramsSubscription: Subscription = Subscription.EMPTY;
    account$: Observable<Account>;

    history = [];
    historySubscription: Subscription = Subscription.EMPTY;

    loadingAccount = 0;

    constructor(private route: ActivatedRoute,
                private service: ApiService) {
    }

    ngOnInit() {
        this.paramsSubscription = this.route.params
        .subscribe((params: Params) => {
            if (params['id']) {
                this.service.loadAccountHistory(params['id']);
            }
        });

        // account
        this.account$ = this.route.paramMap
            .pipe(switchMap((params: ParamMap) => this.service.getAccount(params.get('id'))));

        this.account$.subscribe(data => {
            this.loadingAccount = 1;
        });

        this.historySubscription = this.service.accountHistory.subscribe(history => {
            this.history = history;
        });
    }

    ngOnDestroy() {
        this.paramsSubscription.unsubscribe();
        this.historySubscription.unsubscribe();
    }

}
