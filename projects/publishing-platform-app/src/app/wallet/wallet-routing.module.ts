import { Routes } from '@angular/router';

import { WalletComponent } from './wallet/wallet.component';

// import { TransferComponent } from './transfer/transfer.component';
// import { TransactionsComponent } from './transactions/transactions.component';
// import { ReceiveComponent } from './receive/receive.component';
import { AuthguardService } from '../core/services/authguard.service';

export const walletRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: WalletComponent
            },
            /*{
                path: 'transactions',
                pathMatch: 'full',
                component: TransactionsComponent
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
            }*/
        ],
        canActivateChild: [AuthguardService]
    }
];
