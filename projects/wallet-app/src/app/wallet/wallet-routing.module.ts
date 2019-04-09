import { Routes } from '@angular/router';
import { TransferComponent } from './transfer/transfer.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReceiveComponent } from './receive/receive.component';
import { AuthguardService } from '../core/services/authguard.service';

export const walletRoutes: Routes = [
        {
            path: 'wallet',
            children: [
                {
                    path: '',
                    pathMatch: 'full',
                    redirectTo: '/page-not-found'
                },
                {
                    path: 'transactions',
                    pathMatch: 'full',
                    component: TransactionsComponent,
                },
                {
                    path: 'transfer',
                    pathMatch: 'full',
                    component: TransferComponent
                },
                {
                    path: 'receive',
                    pathMatch: 'full',
                    component: ReceiveComponent
                }
            ],
            canActivateChild: [AuthguardService]
        }
    ]
;
