
import { Component, OnInit, Inject } from '@angular/core';
import { Block } from '../../block';
import { ApiService } from '../../services/api.service';
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
    loadingBlocks = false;
    hasBeenLoaded: boolean;
    lastBlockHash = null;
    blocksLimit = 32;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private apiService: ApiService) {
    }

    ngOnInit() {
        this.route.params.subscribe((params: ParamMap) => {
            this.loadingBlocks = true;
            this.hasBeenLoaded = false;
            this.blocks = [];
            this.blockDate = new Date(params['date']);
            this.blockDate.setHours(23);
            this.blockDate.setMinutes(59);
            this.blockDate.setSeconds(55);
            this.apiService.getNearestBlock(this.blockDate, this.lastBlockHash, this.blocksLimit).subscribe(blockData => {
                this.setBlocksData(blockData);
            });
        });
    }

    private setDate(date) {
        this.lastBlockHash = null;
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

    setBlocksData(blockData) {
        const cd = moment(this.blockDate).format('YYYY-MM-DD');
        const loadedBlocks = blockData.blocks;
        this.blocks = this.blocks.concat(loadedBlocks);
        this.calculateLastBlockHash(this.blocks);
        this.hasBeenLoaded = true;
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

    loadBlocks(count = 10) {
        this.loadingBlocks = true;
        this.apiService.getNearestBlock(this.blockDate, this.lastBlockHash, count).subscribe(blockData => {
            this.setBlocksData(blockData);
        });
    }
}
