import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { ChannelService } from '../services/channel.service';
import { AccountService } from '../services/account.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  public isGray = false;
  public language;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private router: Router,
    public channelService: ChannelService,
    public translateService: TranslateService,
    private accountService: AccountService
  ) {
    this.router.events
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(event => {
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
