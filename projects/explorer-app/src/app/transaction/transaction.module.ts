import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionListComponent } from './list/transaction-list.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [TransactionComponent, TransactionListComponent],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule
  ],
  exports: [
    TransactionComponent, TransactionListComponent
  ]
})
export class TransactionModule {
}
