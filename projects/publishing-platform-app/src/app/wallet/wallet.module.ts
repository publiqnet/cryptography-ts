import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { TransactionsComponent } from './transactions/transactions.component';
import { TransferComponent } from './transfer/transfer.component';
import { WalletComponent } from './wallet/wallet.component';
import { SharedModule } from '../shared/shared.module';
import { ReceiveComponent } from './receive/receive.component';
import { walletRoutes } from './wallet-routing.module';
import { SecurityComponent } from './security/security.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild(),
        RouterModule.forChild(walletRoutes)
    ],
    declarations: [
        TransactionsComponent,
        TransferComponent,
        WalletComponent,
        ReceiveComponent,
        SecurityComponent
    ]
})
export class WalletModule {
}
