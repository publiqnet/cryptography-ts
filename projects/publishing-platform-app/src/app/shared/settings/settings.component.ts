import { Component, Inject, Input, isDevMode, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { ValidationService } from '../../core/validator/validator.service';
import { NotificationService } from '../../core/services/notification.service';
import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { DialogService } from '../../core/services/dialog.service';
import { SafeStylePipe } from '../../core/pipes/safeStyle.pipe';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [ SafeStylePipe ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input() hideElement = true;
  first_name: String;
  last_name: String;
  email: String;
  settingsForm: FormGroup;
  errorMessages: string;
  conditionsWarning: string;
  formSubmitted = false;
  disableSaveBtn = true;
  password = '';
  passwordVerified = false;
  decryptedBrainKey: string;
  requestData;
  reseting = false;
  brainKey;
  photo: File;
  currentImage: string;
  name: string;
  id: string;

  isProfileUpdating = false;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private accountService: AccountService,
    private FormBuilder: FormBuilder,
    private notification: NotificationService,
    private errorService: ErrorService,
    public dialogService: DialogService,
    private safeStylePipe: SafeStylePipe,
    private translationService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    this.accountService.accountUpdated$
      .pipe(
        filter(result => result != null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(acc => {
        this.fillSettingsForm();
        this.buildForm();
      });

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: ErrorEvent) => {
          if (['uploadPhoto', 'updateAccount', 'blockchainUpdateAccount'].includes(error.action)) {
            this.notification.error(error.message);
          } else if (['not_found_author_account', 'need_private_key', 'account_update_failed'].includes(error.action)) {
            if (isDevMode()) {
              console.log(error);
            }
          }
        }
      );

    this.accountService.updateAccountDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(account => {
          // this.accountService.resetAuthorData(this.id);
          this.accountService.settingsSavedCloseDialog.emit(true);
          this.disableSaveBtn = true;

          const message = this.translationService.instant('success');
          this.notification.success(message['account_updated']);
        }
      );

    this.accountService.profileUpdatingChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.isProfileUpdating = data;
      });
  }

  fillSettingsForm() {
    this.email = this.accountService.accountInfo.email;
    this.first_name = this.accountService.accountInfo.firstName;
    this.last_name = this.accountService.accountInfo.lastName;

    if (this.accountService.accountInfo.image) {
      this.currentImage = this.accountService.accountInfo.image;
    }
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      return;
    }

    const formData = new FormData();
    if (this.photo) {
      formData.append('image', this.photo, this.photo.name);
    }
    formData.append('firstName', this.settingsForm.controls['firstName'].value);
    formData.append('lastName', this.settingsForm.controls['lastName'].value);
    this.accountService.updateAccount(formData)
      .subscribe(data => {
        this.accountService.settingsSavedCloseDialog.emit(true);
        this.disableSaveBtn = true;

        const message = this.translationService.instant('success');
        this.notification.success(message['account_updated']);
      });
  }

  private buildForm() {
    this.settingsForm = this.FormBuilder.group({
        firstName: new FormControl(this.first_name, []),
        lastName: new FormControl(this.last_name, [])
      },
      {validator: ValidationService.noSpaceValidator}
    );
    this.settingsForm.valueChanges.subscribe(newValues => {
      this.errorMessages = '';
      this.conditionsWarning = '';

      this.disableSaveBtn = true;
      const trimmedFn = newValues.firstName.trim();

      if (
        (this.photo && (this.accountService.accountInfo.firstName === '' || trimmedFn !== '')) ||
        trimmedFn != '' && (trimmedFn !== this.accountService.accountInfo.firstName || newValues.lastName.trim() !== this.accountService.accountInfo.lastName)
      ) {
        this.disableSaveBtn = false;
      }
    });
  }

  showUploadedImage(event) {
    if (isPlatformBrowser(this.platformId)) {
      const input = event.target;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (e && e.target) {
            this.currentImage = e.target.result;
            this.photo = input.files[0];
            if (this.photo) {
              this.reseting = false;
              if (this.accountService.accountInfo.firstName === '' ||
                this.settingsForm.controls['firstName'].value &&
                this.settingsForm.controls['firstName'].value.trim() !== '') {
                this.disableSaveBtn = false;
              }
            }
          }
        };
        reader.readAsDataURL(input.files[0]);
      }
    }
  }

  resetImage(fileToUpload) {
    this.currentImage = null;
    this.photo = null;
    this.reseting = true;
    this.disableSaveBtn = false;
    fileToUpload.value = '';
  }

  getCurrentImage() {
    const profileImage = this.currentImage ? this.currentImage : '/assets/no-image-article.jpg';
    return this.safeStylePipe.transform(`url(${profileImage})`);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
    this.passwordVerified = false;
    this.decryptedBrainKey = '';
    this.requestData = '';
    this.password = '';
  }
}
