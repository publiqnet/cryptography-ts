import { Component, OnInit, OnDestroy } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { Broadcaster } from '../../broadcaster/broadcaster';
import { WalletService } from '../../core/services/wallet.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private broadcaster: Broadcaster,
              public walletService: WalletService) {
  }

  ngOnInit(): void {
    this.broadcaster
      .on<any>('changeToTabTransactions')
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.walletService.selectedTabIndex = this.walletService.tabs.transaction;
      });
  }

  onLinkClick(event) {
    this.walletService.selectedTabIndex = event.index;
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.walletService.selectedTabIndex = this.walletService.tabs.receive;
  }
}
