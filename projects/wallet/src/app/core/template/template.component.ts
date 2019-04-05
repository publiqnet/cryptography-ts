import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { AccountService } from '../services/account.service';

@Component({
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {
    navIsFixed: boolean;
    isBrowser = false;
    public loading = false;

    constructor(@Inject(DOCUMENT) private document: Document,
                private accountService: AccountService,
                @Inject(PLATFORM_ID) private platformId: Object) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.isBrowser = true;
        }
    }

    @HostListener('window:scroll', [])

    onWindowScroll() {
        if (isPlatformBrowser(this.platformId)) {
            if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
                this.navIsFixed = true;
            } else if (this.navIsFixed && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
                this.navIsFixed = false;
            }
        }
    }

    scrollToTop() {
        if (isPlatformBrowser(this.platformId)) {
            (function smoothscroll() {
                const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
                if (currentScroll > 0) {
                    window.requestAnimationFrame(smoothscroll);
                    window.scrollTo(0, currentScroll - (currentScroll / 5));
                }
            })();
        }
    }
}
