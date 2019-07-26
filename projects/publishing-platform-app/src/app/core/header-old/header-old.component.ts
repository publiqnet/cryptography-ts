import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { filter, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { AccountService } from '../services/account.service';
import { ArticleService } from '../services/article.service';
import { ErrorEvent, ErrorService } from '../services/error.service';
import { environment } from '../../../environments/environment';
import { ChannelService } from '../services/channel.service';
import { DialogService } from '../services/dialog.service';
import { WalletService } from '../services/wallet.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-header-old',
  templateUrl: './header-old.component.html',
  styleUrls: ['./header-old.component.scss']
})
export class HeaderOldComponent implements OnInit, OnDestroy {
  account: any = null;
  balance: any = null;
  showTagList = false;
  selectedTag: any = null;
  searchBar = false;
  notificationCount = 0;
  showNotificationDropdown = false;
  navTabView = '';
  currentArticleLink = '';
  articleMetaData = null;
  socialsOpen = false;
  public logoImage = environment.filestorage_link + '/default/publiq.svg';

  channel = false;
  public isHistoryArticle = false;
  public historyArticleData = '';

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notification: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private articleService: ArticleService,
    private errorService: ErrorService,
    private dialogService: DialogService,
    private channelService: ChannelService,
    @Inject(DOCUMENT) private document,
    private walletService: WalletService
  ) {
    this.router.events.subscribe(result => {
      if (result instanceof NavigationEnd) {
        this.navView(result['urlAfterRedirects']);
      }
    });
  }

  ngOnInit() {
    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: ErrorEvent) => {
        if (error.action === 'oauth_decrypt_brain_key') {
          console.log('oauth_decrypt_brain_key', error.message);
          localStorage.removeItem('auth');
          localStorage.setItem('lang', 'en');
        } else if (error.action === 'loginSession') {
          console.log('login-session-error---', error.message);
          localStorage.removeItem('auth');
          localStorage.setItem('lang', 'en');
        } else if (error.action === 'logout') {
          console.log('logout-error----', error.message);
        } else if (error.action === 'load_balance_error') {
          console.log('load_balance_error----', error.message);
        }
      });

    this.accountService.loginSessionDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe();

    this.accountService.showTagList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(visibility => {
          this.showTagList = visibility;
        }
      );

    this.accountService.showSearchBar$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        visibility => {
          this.searchBar = visibility;
        }
      );

    // this.accountService.balanceChanged
    //   .pipe(
    //     filter(result => result != null),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe((balance: number) => {
    //       if (this.accountService.accountInfo) {
    //         this.accountService.accountInfo.balance = balance;
    //         return (this.balance = {
    //           balance: balance,
    //           balance_pbq: balance / 100000000
    //         });
    //       }
    //     }
    //   );

    this.accountService.accountUpdated$
      .pipe(
        filter(result => result != null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(result => {
        this.account = result;
      });

    this.articleService
      .getHeaderArticleMeta()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.articleMetaData = data;
        if (data) {
          const baseUrl = this.document.location.origin;
          this.currentArticleLink = baseUrl + '/s/' + data._id;
        }
        const listener = this.bodyScrollListener.bind(this);
        if (isPlatformBrowser(this.platformId)) {
          if (this.articleMetaData) {
            window.onscroll = listener;
          } else {
            window.onscroll = null;
          }
        }
      });

    this.accountService.logoutDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.account = null;
        this.balance = null;
        this.articleService.loadSuggestContentsByTags(false);
        this.walletService.destroyExternalWsService();
        this.router.navigate(['/']);
      });

    this.articleService.articleEventEmitter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.isHistoryArticle = data.isHistory;
        if (this.isHistoryArticle && data.mainArticleHash) {
          this.historyArticleData = data.mainArticleHash;
        }
      });

    this.channel = ChannelService.isChannelMain(this.channelService.channel);
  }

  bodyScrollListener(e) {
    if (isPlatformBrowser(this.platformId)) {
      const scrollTop =
        document.querySelector('html').scrollTop || document.body.scrollTop;
      const scrollHeight = document.body.offsetHeight;

      const h = document.documentElement,
        b = document.body,
        st = 'scrollTop',
        sh = 'scrollHeight';

      document
        .querySelector('mat-toolbar')
        .classList[scrollTop > 150 ? 'add' : 'remove']('shrink');

      (document.querySelector('.reading-progress') as HTMLElement).style.width =
        Math.min(
          (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight - 420) * 100,
          100
        ) + '%';
    }
  }

  navView(url) {
    if (url !== '/stories') {
      this.selectedTag = null;
    }
    if (url === '/user/login') {
      this.navTabView = 'login';
    } else if (url === '/user/register') {
      this.navTabView = 'register';
    } else {
      this.navTabView = '';
    }
  }

  signout() {
    this.accountService.logout();
  }

  tagListToggle() {
    if (this.searchBar) {
      this.searchBar = !this.searchBar;
    }
    this.showTagList = !this.showTagList;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = !this.showTagList ? 'auto' : 'hidden';
    }
  }

  targetEvent(event) {
    this.tagListToggle();
  }

  onSelect(tag: any) {
    this.selectedTag = tag;
  }

  toggleSearchBar() {
    this.searchBar = !this.searchBar;
    if (this.showTagList) {
      this.showTagList = !this.showTagList;
    }
  }

  checkImageHashExist() {
    if (!this.articleMetaData) {
      return false;
    }
    const fullName = this.articleMetaData.full_account
      ? this.articleMetaData.full_account
      : '';
    const meta = fullName.meta ? fullName.meta : '';
    const image = meta.image_hash ? meta.image_hash : '';
    return !!(
      fullName &&
      meta &&
      image &&
      image !== '' &&
      !image.startsWith('http://127.0.0.1') &&
      image.indexOf('_thumb') !== -1
    );
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeNotificationDD() {
    this.showNotificationDropdown = false;
  }

  updateNotificationCount(count: number) {
    this.notificationCount = count;
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      (function smoothScroll() {
        const currentScroll =
          document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothScroll);
          window.scrollTo(0, currentScroll - currentScroll / 5);
        }
      })();
    }
  }

  redirectToWalletSecurity() {
    this.walletService.selectedTabIndex = this.walletService.tabs.security;
    this.router.navigate(['/wallet']);
  }

  articleUpdatedVersion(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      event.preventDefault();
      if (this.historyArticleData) {
        this.router.navigate([`/s/${this.historyArticleData}`]);
      }
    }
  }

  redirectTo(path: string): void {
    if (!path) {
      return;
    }
    if (path === '/content/newcontent' || '/content/mycontent') {
      const channelAuthors = this.channelService.getChannelAuthors();
      if (
        this.accountService.loggedIn() &&
        channelAuthors.length > 0 &&
        !channelAuthors.includes(this.account.name)
      ) {
        this.dialogService.openChannelNotAllowedDialog();
        return;
      }
    }

    this.router.navigate(['/' + path]);
    return;
  }

  share(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.open(
        'https://www.facebook.com/sharer/sharer.php?u=' + url,
        'pop',
        'width=600, height=400, scrollbars=no'
      );
    }
  }

  toggleSocials() {
    this.socialsOpen = !this.socialsOpen;
  }

  copy() {
    const el = document.createElement('textarea');
    el.value = location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.notification.success('Copied');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
