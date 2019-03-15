import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})
export class RecoverComponent implements OnInit, OnDestroy {

  public formView = '';
  public brainKey = '';
  public loading = false;
  public brainKeyError = '';
  isPasswordMode: boolean;
  private stringToSign = '';

  errorEventEmiterSubscription = Subscription.EMPTY;
  signedStringSubscription = Subscription.EMPTY;

  constructor(private accountService: AccountService,
              @Inject(PLATFORM_ID) private platformId: Object,
              private errorService: ErrorService,
              private router: Router) {
  }

  ngOnInit() {
    this.isPasswordMode = false;
    this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((error: ErrorEvent) => {
      if (error.action === 'recover') {
        this.loading = false;
        this.brainKeyError = this.errorService.getError('incorrect_recover_phrase');
      }
    });

    this.signedStringSubscription = this.accountService.signedStringChanged.subscribe(stringToSign => {
      // this.router.navigate(['/user/new-password']);
      this.isPasswordMode = true;
    });
  }

  focusFunction() {
    this.brainKeyError = '';
  }

  checkBrainKey() {
    this.loading = true;
    this.accountService.checkBrainkey(this.brainKey)
      .subscribe(authData => {
        this.stringToSign = authData.stringToSign;
        this.isPasswordMode = true;
      }, error => this.errorService.handleError('recover', error));
  }

  ngOnDestroy() {
    // if (isPlatformBrowser(this.platformId)) {
    this.brainKeyError = '';
    this.signedStringSubscription.unsubscribe();
    this.errorEventEmiterSubscription.unsubscribe();
    // }
  }
}
