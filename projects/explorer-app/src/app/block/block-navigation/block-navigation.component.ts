/**
 * Created by vaz on 9/22/17.
 */

import { Component, OnInit, Inject } from '@angular/core';
import { Block } from '../../block';
import { ApiService } from '../../api.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    templateUrl: 'block-navigation.component.html',
    styleUrls: ['block-navigation.component.css']
})
export class BlockNavigationComponent implements OnInit {

    blocks: Block[] = [];
    blockDate: Date;
    startBlock: number;
    loadingBlocks: number;
    hasBeenLoaded: boolean;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private apiService: ApiService) {
    }

    ngOnInit() {
        this.route.params.subscribe((params: ParamMap) => {

            this.loadingBlocks = 0;
            this.hasBeenLoaded = false;
            this.blocks = [];

            this.blockDate = new Date(params['date']);

            this.blockDate.setHours(23);
            this.blockDate.setMinutes(59);
            this.blockDate.setSeconds(55);

            this.apiService.getNearestBlock(this.blockDate).subscribe(block => {
                if (block) {
                    this.startBlock = block.block_number;
                }
                this.loadBlocks(32);
            });
        });
    }

    private setDate(date) {
        this.router.navigateByUrl('/block/date/' + date.format('YYYY-MM-DD'));
    }

    now() {
        return new Date();
    }

    moveDate(date: Date, days: number) {
        return moment(date).add(days, 'day').toDate();
    }

    next() {
        this.setDate(moment(this.blockDate).add(1, 'day'));
    }

    previous() {
        this.setDate(moment(this.blockDate).subtract(1, 'day'));
    }

    loadBlocks(count = 10) {
        const cd = moment(this.blockDate).format('YYYY-MM-DD');

        if (this.loadingBlocks === -1) {
            this.loadingBlocks = 1;
        } else {
            this.loadingBlocks++;
        }

        const blockIDs = [];
        for (let index = 0; index < count; index++) {
            blockIDs.push(this.startBlock--);
        }

        this.apiService.getBlocks(blockIDs)
            .subscribe(blocks => {
                this.hasBeenLoaded = true;
                this.loadingBlocks--;
                blocks.forEach(block => {
                    if (block !== null && cd === moment(block.timestamp).format('YYYY-MM-DD')) {
                        this.blocks.push(block);
                    }
                });
            });
    }
}
