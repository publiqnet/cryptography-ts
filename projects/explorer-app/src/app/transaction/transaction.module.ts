import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionListComponent } from './list/transaction-list.component';

@NgModule({
  declarations: [TransactionComponent, TransactionListComponent],
  imports: [
    CommonModule,
    TransactionRoutingModule
  ],
  exports: [
    TransactionComponent, TransactionListComponent
  ]
})
export class TransactionModule {
}
