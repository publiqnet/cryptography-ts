import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction/transaction.component';
import { RouterModule } from '@angular/router';
import { ErrorPageComponent } from '../shared/error-page/error-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
                {
                    path: 'not-exists',
                    component: ErrorPageComponent,
                    data: {message: 'Transaction not found!'}
                },
                {
                    path: ':id',
                    pathMatch: 'full',
                    component: TransactionComponent,
                }
            ],
        )
    ],
    declarations: [TransactionComponent]
})
export class TransactionModule {
}
