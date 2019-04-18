import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionListComponent } from './list/transaction-list.component';

export const transactionRoutes: Routes = [
  {
    path: 't',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TransactionListComponent
      },
      {
        path: ':hash',
        pathMatch: 'full',
        component: TransactionComponent
      }
    ]
  },
  {path: '**', redirectTo: '/not-found'}
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(transactionRoutes)
  ],
  exports: [RouterModule]
})

export class TransactionRoutingModule {}
