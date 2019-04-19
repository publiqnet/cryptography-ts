
import { Component, Input, OnInit } from '@angular/core';
import { Block } from '../../services/models/block';

@Component({
    selector: 'app-block-list',
    styleUrls: ['./block-list.component.css'],
    templateUrl: './block-list.component.html'
})
export class BlockListComponent implements OnInit {
    @Input() blocks: Block[];

    ngOnInit(): void {
        // console.log(this.blocks);
    }
}
