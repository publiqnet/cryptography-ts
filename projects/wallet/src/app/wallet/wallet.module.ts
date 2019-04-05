import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransferComponent } from './transfer/transfer.component';
import { WalletComponent } from './wallet/wallet.component';
import { SharedModule } from '../shared/shared.module';
import { ReceiveComponent } from './receive/receive.component';


@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [TransactionsComponent,
        TransferComponent,
        WalletComponent,
        ReceiveComponent
    ]
})
export class WalletModule {
}
