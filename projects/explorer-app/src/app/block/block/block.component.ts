
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Block } from '../../block';

@Component({
    selector: 'app-block',
    templateUrl: './block.component.html',
    styles: []
})
export class BlockComponent implements OnInit {
    block: Block;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.data.subscribe((data: Data) => {
            this.block = data['block'];
        });
    }
}
