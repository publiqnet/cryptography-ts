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

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input() hideElement = true;
  shortName: string;
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
  // channels = [];
  reseting = false;
  brainKey;
  // accountInfo;
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
          // this.accountInfo = acc;
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
            } else if (['not_found_author_account', 'need_private_key', 'account_update_failed', 'updateAccountEnd'].includes(error.action)) {
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

      // this.accountService.profileUpdatingChanged
      //   .pipe(
      //     takeUntil(this.unsubscribe$)
      //   )
      //   .subscribe(data => {
      //     this.isProfileUpdating = data;
      //   });
  }

  fillSettingsForm() {
    this.email = this.accountService.accountInfo.email;
    this.first_name = this.accountService.accountInfo.firstName;
    this.last_name = this.accountService.accountInfo.lastName;
    let fullName = '';
    if (this.first_name) {
      fullName += '' + this.first_name.charAt(0);
    }

    if (this.last_name) {
      fullName += '' + this.last_name.charAt(0);
    }
    this.shortName = fullName.trim() ? fullName.toUpperCase() : '';

    // if (this.accountInfo.id) {
    //   this.id = this.accountInfo.id;
    //
    //   if (this.accountInfo.meta) {
    //     if (this.accountInfo.meta.first_name) {
    //       this.first_name = this.accountInfo.meta.first_name;
    //     }
    //     if (this.accountInfo.meta.last_name) {
    //       this.last_name = this.accountInfo.meta.last_name;
    //     }
    //
    //     if (this.accountInfo.meta.image_hash) {
    //       this.currentImage = this.accountInfo.meta.image_hash;
    //     }
    //
    //     let fullName = '';
    //     if (this.first_name) {
    //       fullName += '' + this.first_name.charAt(0);
    //     }
    //
    //     if (this.last_name) {
    //       fullName += '' + this.last_name.charAt(0);
    //     }
    //     this.shortName = fullName.trim() ? fullName.toUpperCase() : '';
    //   }
    // }
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      return;
    }

    this.accountService.updateAccount(this.settingsForm.value).subscribe(data => {
      this.disableSaveBtn = true;

      const message = this.translationService.instant('success');
      this.notification.success(message['account_updated']);
    });
  }

  updateSetting() {
    if (this.settingsForm.invalid) {
      return;
    }


    // const imageUrlBefor = (this.accountInfo && this.accountInfo.meta && this.accountInfo.meta.image_hash) ? this.accountInfo.meta.image_hash : '';
    //
    // const messages = this.translationService.instant('dialog.confirm');
    // const dialogConfig = {maxWidth: '600px', panelClass: 'modal-padding'};
    // this.dialogService.openConfirmDialog(messages['account_update_title'])
    //   .pipe(
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe((confirm) => {
    //     if (!confirm) {
    //       this.currentImage = imageUrlBefor;
    //       return;
    //     }
    //
    //     const titleText = this.translationService.instant('dialog.password.title');
    //     const descriptionText = this.translationService.instant('dialog.password.update_account');
    //     this.dialogService.openInputPasswordDialog('show-private-key', titleText, descriptionText, dialogConfig)
    //       .pipe(
    //         takeUntil(this.unsubscribe$)
    //       )
    //       .subscribe(data => {
    //         if (!data) {
    //           this.currentImage = imageUrlBefor;
    //           return;
    //         }
    //         this.formSubmitted = true;
    //         this.requestData = this.settingsForm.value;
    //         this.requestData.image_hash = '';
    //         if (this.photo) {
    //           // if photo is present, upload it and return the resulting hash
    //           this.accountService.uploadPhoto(this.photo)
    //             .pipe(
    //               takeUntil(this.unsubscribe$)
    //             )
    //             .subscribe((result) => {
    //               if (result && result.user_profile_original_image && result.user_profile_thumb_image) {
    //                 this.currentImage = result.user_profile_thumb_image;
    //                 this.requestData.image_hash = result.user_profile_thumb_image;
    //               }
    //               if (data && data.password) {
    //                 return this.accountService.updateAccount(this.requestData, data.password); // this.submit(data.password);
    //               }
    //             }, (error) => {
    //               this.currentImage = imageUrlBefor;
    //               this.errorService.handleError('uploadPhoto', error);
    //             });
    //         } else {
    //           if (this.accountInfo.meta.image_hash && this.reseting) {
    //             this.requestData.image_hash = '';
    //           } else if (this.accountInfo.meta.image_hash && !this.reseting) {
    //             this.requestData.image_hash = this.accountInfo.meta.image_hash;
    //           }
    //           if (data && data.password) {
    //             return this.accountService.updateAccount(this.requestData, data.password); // this.submit(data.password);
    //           }
    //         }
    //       });
    //   });
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
    // if (isPlatformBrowser(this.platformId)) {
    //   const input = event.target;
    //   if (input.files && input.files[0]) {
    //     const reader = new FileReader();
    //     reader.onload = (e: any) => {
    //       if (e && e.target) {
    //         this.currentImage = e.target.result;
    //         this.photo = input.files[0];
    //         if (this.photo) {
    //           this.reseting = false;
    //           if (this.accountInfo.first_name === '' ||
    //             this.settingsForm.controls['first_name'].value &&
    //             this.settingsForm.controls['first_name'].value.trim() !== '') {
    //             this.disableSaveBtn = false;
    //           }
    //         }
    //       }
    //     };
    //     reader.readAsDataURL(input.files[0]);
    //   }
    // }
  }

  resetImage(fileToUpload) {
    this.currentImage = null;
    this.photo = null;
    this.reseting = true;
    this.disableSaveBtn = false;
    fileToUpload.value = '';
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
