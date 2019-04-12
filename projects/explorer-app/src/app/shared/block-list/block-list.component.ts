/**
 * Created by vaz on 9/22/17.
 */

import { Component, Input } from '@angular/core';
import { Block } from '../../block';

@Component({
    selector: 'app-block-list',
    styleUrls: ['./block-list.component.css'],
    templateUrl: './block-list.component.html'
})
export class BlockListComponent {
    @Input() blocks: Block[];
}
