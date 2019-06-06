import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { Transaction } from '../../services/models/Transaction';
import { ApiService } from '../../services/api.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styles: []
})
export class TransactionComponent implements OnInit, OnDestroy {
  @Input() transaction?: Transaction;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private utilService: UtilService,
              private apiService: ApiService) {
  }

  ngOnInit() {
    if (!this.transaction) {
        this.route.params
          .pipe(
            filter((params: any) => params.hash),
            switchMap((params: {hash: string}) => this.apiService.getTransactionByHash(params.hash)),
            takeUntil(this.unsubscribe$)
          )
          .subscribe((transaction: Transaction) => {
            this.transaction = transaction;
          });
    }
  }

  redirect($event, page, param) {
    $event.preventDefault();
    this.transaction = null;
    this.router.navigate([`/${page}/${param}`]);
  }

  ngOnDestroy(): void {
    this.transaction = null;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
