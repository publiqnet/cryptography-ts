import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AccountTransactionListComponent } from './transaction-list/account-transaction-list.component';

export const accountRoutes: Routes = [
  {
    path: 'a',
    children: [
      {
        path: 't/:address',
        pathMatch: 'full',
        component: AccountTransactionListComponent
      },
      // {
      //   path: 'r/:address',
      //   pathMatch: 'full',
      //   component: AccountTransactionListComponent
      // },
      {
        path: ':address',
        pathMatch: 'full',
        component: AccountComponent
      }
    ]
  }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(accountRoutes)
  ],
  exports: [RouterModule]
})

export class AccountRoutingModule {}
