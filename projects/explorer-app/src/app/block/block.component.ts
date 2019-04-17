import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-block',
    templateUrl: './block.component.html',
    styles: []
})
export class BlockComponent implements OnInit {
    @Input() blockData?: any;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        // if (!this.blockData) {
        //     this.route.data.subscribe((data: Data) => {
        //         this.blockData = data['block'];
        //     });
        // }

        console.log(this.blockData);
    }
}
