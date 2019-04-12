/**
 * Created by vaz on 9/20/17.
 */

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Block } from '../block';
import { ApiService } from '../api.service';


@Component({
    selector: 'app-homepage',
    templateUrl: 'homepage.component.html',
    styleUrls: []
})
export class HomepageComponent implements OnInit {

    today: Date;
    blocks: Block[] = [];
    currentBlock: number;
    loadingBlocks = 0;
    readonly number_of_blocks = 7;

    constructor(protected apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) {
        this.today = new Date();
    }

    ngOnInit() {

        // this is just optimisation for the server
        if (isPlatformBrowser(this.platformId)) {
            // Client only code.
            this.loadingBlocks++;

            this.apiService.getHeadBlock()
                .subscribe(data => {

                    this.loadingBlocks--;

                    // lets load

                    this.currentBlock = data.block_number;
                    const blocks = [];

                    this.loadingBlocks++;
                    for (let index = 0; index <= this.number_of_blocks - 1; index++) {
                        blocks.push(this.currentBlock - index - 1);
                    }

                    this.apiService.getBlocks(blocks).subscribe(blocks => {
                        this.loadingBlocks--;
                        this.blocks = blocks;
                    });

                    setInterval(() => {
                        this.addBlock(this.currentBlock++);
                    }, 30000);
                }, error => {
                    console.log('catch', error);
                });

        }
    }

    private addBlock(block_number: number) {
        this.apiService.getBlock(block_number)
            .subscribe(data => {

                this.loadingBlocks--;

                if (!data) {
                    this.currentBlock--;
                } else {
                    this.blocks.unshift(data);

                    if (this.blocks.length > this.number_of_blocks) {
                        this.blocks.pop();
                    }
                }
            });
    }
}
