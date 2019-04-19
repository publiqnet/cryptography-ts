import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockchainBlock } from '../services/models/BlockchainBlock';
import { Transaction } from '../services/models/Transaction';
import { ApiService } from '../services/api.service';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { of, ReplaySubject } from 'rxjs';
import { TransactionResponse } from '../services/models/TransactionResponse';
import { SearchResponse } from '../services/models/SearchResponse';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit, OnDestroy {
  @Input() blockData?: BlockchainBlock;

  transactions: Transaction[];
  allTransactionsCount: number;
  blockInfiniteScroll = false;
  seeMoreChecker = false;
  lastTransactionHash = '';
  loadingBlocks = false;
  transactionsLimit = 10;
  transactionsFrom = 0;
  hasBeenLoaded: boolean;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
              private router: Router,
              private route: ActivatedRoute,
              private apiService: ApiService) {
  }

  ngOnInit() {
    if (!this.blockData) {
        this.route.params
          .pipe(
            filter((params: any) => params.hash),
            switchMap((params: {hash: string}) => this.apiService.search(params.hash)),
            takeUntil(this.unsubscribe$)
          )
          .subscribe((data: SearchResponse) => this.blockchainBlockData = data.object);
    } else {
      this.blockchainBlockData = this.blockData;
    }
  }

  set blockchainBlockData(blockData: BlockchainBlock) {
    if (!this.blockData) {
      this.blockData = blockData;
    }
    this.allTransactionsCount = blockData.transactionsCount;
    this.transactions = blockData.transactions;

    this.calculateLastTransactionHash(this.transactions);
    this.seeMoreChecker = this.blockData.transactionsCount > this.transactions.length;

  }

  seeMore() {
    this.loadingBlocks = true;
    this.blockInfiniteScroll = true;
    this.seeMoreChecker = true;
    this.transactionsFrom = this.transactionsFrom + 10;
    this.apiService.getBlockTransactions(this.blockData.hash, this.transactionsFrom, this.transactionsLimit)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: TransactionResponse) => this.setBlockTransactionsData(data.transactions));
  }

  setBlockTransactionsData(transactions: Transaction[]) {
    this.transactions = this.transactions.concat(transactions);
    this.seeMoreChecker = this.blockData.transactionsCount > this.transactions.length;
    this.calculateLastTransactionHash(transactions);
    this.hasBeenLoaded = true;
    this.loadingBlocks = false;
    this.blockInfiniteScroll = false;
  }

  calculateLastTransactionHash(transactions: Transaction[]) {
    if (transactions.length >= this.transactionsLimit) {
      const last = transactions.length - 1;
      if (transactions[last].transactionHash !== this.lastTransactionHash) {
        this.lastTransactionHash = transactions[last].transactionHash;
      }
    }
  }

  getBlockFee(block) {
    if (!block.fee) {
      return '0.0';
    }
    return block.fee.whole + '.' + block.fee.fraction;
  }

  redirect($event, page, param) {
    $event.preventDefault();
    this.blockData = null;
    this.router.navigate([`/${page}/${param}`]);
  }

  ngOnDestroy(): void {
    this.blockData = null;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
