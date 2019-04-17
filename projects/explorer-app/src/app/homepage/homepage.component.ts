import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { Block } from '../services/models/block';
import { ApiService } from '../services/api.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: 'homepage.component.html',
  styleUrls: []
})
export class HomepageComponent implements OnInit, OnDestroy {
  today: Date;
  blocks: Block[] = [];
  public seeMoreChecker = false;
  lastBlockHash = '';
  loadingBlocks = true;
  blocksLimit = 7;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(protected apiService: ApiService) {
    this.today = new Date();
  }

  ngOnInit() {
    this.apiService.loadBlocks(this.lastBlockHash, this.blocksLimit)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.setBlocksData(data);
      }, error => {
        console.log('catch', error);
      });
  }

  setBlocksData(data) {
    this.seeMoreChecker = !!data.more;
    const loadedBlocks = data.blocks;
    this.blocks = this.blocks.concat(loadedBlocks);
    this.calculateLastBlockHash(this.blocks);
    this.loadingBlocks = false;
  }

  calculateLastBlockHash(blocks) {
    if (blocks.length >= this.blocksLimit) {
      const last = blocks.length - 1;
      if (blocks[last].hash !== this.lastBlockHash) {
        this.lastBlockHash = blocks[last].hash;
      }
    }
  }

  viewMore() {
    this.apiService.loadBlocks(this.lastBlockHash, this.blocksLimit)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.setBlocksData(data);
      });
  }

  private addBlock(block_number: number) {
    // this.apiService.getBlock(block_number)
    //     .subscribe(data => {
    //
    //         this.loadingBlocks--;
    //
    //         if (!data) {
    //             this.currentBlock--;
    //         } else {
    //             this.blocks.unshift(data);
    //
    //             if (this.blocks.length > this.number_of_blocks) {
    //                 this.blocks.pop();
    //             }
    //         }
    //     });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.blocks = [];
  }
}
