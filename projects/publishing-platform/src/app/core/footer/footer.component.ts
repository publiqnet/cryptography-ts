import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { ChannelService } from '../services/channel.service';
import { AccountService } from '../services/account.service';

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    private actionClass: string;
    public isGray = false;
    public language;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router,
        public channelService: ChannelService,
        public translateService: TranslateService,
        private accountService: AccountService
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.isGray = event.url.startsWith('/s/');
            }
        });
    }

    ngOnInit() {
    }

    useLang(lang) {
        this.language = lang;
        if (this.translateService.currentLang != lang) {
            localStorage.setItem('lang', lang);
            this.translateService.use(lang);
        } else {
            this.accountService.changeLang(lang);
        }
    }
}
