import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Transaction } from '../../services/models/Transaction';
import { ApiService } from '../../services/api.service';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styles: []
})
export class TransactionComponent implements OnInit, OnDestroy {
  @Input() transaction?: Transaction;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
  }

  ngOnInit() {
    if (!this.transaction) {
        this.route.params
          .pipe(
            filter((params: any) => params.hash),
            switchMap((params: {hash: string}) => this.apiService.getTransactionByHash(params.hash)),
            takeUntil(this.unsubscribe$)
          )
          .subscribe((transaction: Transaction) => this.transaction = transaction);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
