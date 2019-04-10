import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html'
})
export class HomepageComponent implements OnInit {
    public loading = true;

    constructor(private titleService: Title,
                @Inject(PLATFORM_ID) private platformId: Object) {
    }

    ngOnInit() {
        this.titleService.setTitle('PUBLIQ Web Wallet');
    }
}
