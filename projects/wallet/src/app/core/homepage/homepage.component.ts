import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AccountService } from '../services/account.service';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html'
})
export class HomepageComponent implements OnInit {
    public loading = true;

    constructor(private titleService: Title,
                @Inject(PLATFORM_ID) private platformId: Object,
                public accountService: AccountService) {
    }

    ngOnInit() {
        this.titleService.setTitle('PUBLIQ Web Wallet');
    }
}
