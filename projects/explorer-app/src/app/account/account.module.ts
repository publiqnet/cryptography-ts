import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account/account.component';
import { AccountTransactionListComponent } from './transaction-list/account-transaction-list.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatProgressSpinnerModule } from '@angular/material';

@NgModule({
  declarations: [AccountComponent, AccountTransactionListComponent],
  imports: [
    CommonModule,
    AccountRoutingModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule
  ],
  exports: [
    AccountComponent, AccountTransactionListComponent
  ]
})
export class AccountModule {
}
