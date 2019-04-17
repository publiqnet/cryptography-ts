import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockchainBlock } from '../services/models/BlockchainBlock';
import { Transaction } from '../services/models/Transaction';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styles: []
})
export class BlockComponent implements OnInit {
  @Input() blockData?: BlockchainBlock;

  transactions: Transaction[];
  allTransactionsCount: number;
  seeMoreChecker = false;
  seeMoreLoading = false;
  public blockInfiniteScroll = false;
  private startFromBlock = '';
  private firstBlock = '';
  private transactionDefaultCount = 10;


  constructor(private route: ActivatedRoute, private apiService: ApiService) {
  }

  ngOnInit() {
    // if (!this.blockData) {
    //     this.route.data.subscribe((data: Data) => {
    //         this.blockData = data['block'];
    //     });
    // }

    if (this.blockData) {
      this.allTransactionsCount = this.blockData.transactionsCount;
      this.transactions = this.blockData.transactions;

      if (this.blockData.transactions.length > this.transactionDefaultCount) {
        const lastIndex = this.blockData.transactions.length - 1;
        if (this.blockData.transactions[lastIndex].transactionHash !== this.startFromBlock) {
          this.startFromBlock = this.blockData.transactions[lastIndex].transactionHash;
          this.blockData.transactions.pop();
        }
      }

      this.seeMoreChecker = this.blockData.transactionsCount > this.transactions.length;
    }
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.blockInfiniteScroll = true;
    this.seeMoreChecker = true;
    // this.apiService.loadBlocks();
  }
}
