import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material';

import { TranslateService } from '@ngx-translate/core';
import { Subject, ReplaySubject } from 'rxjs';
import { map, debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { AccountService } from '../../core/services/account.service';
import { ErrorService, ErrorEvent } from '../../core/services/error.service';
import { PublicationService } from '../../core/services/publication.service';
import { NotificationService } from '../../core/services/notification.service';
import { Account } from '../../core/services/models/account';

@Component({
  selector: 'app-search-member',
  templateUrl: './search-member.component.html',
  styleUrls: ['./search-member.component.scss']
})
export class SearchMemberComponent implements OnInit, OnChanges, OnDestroy {

  constructor(
    private publicationService: PublicationService,
    private accountService: AccountService,
    private element: ElementRef,
    private errorService: ErrorService,
    private translateService: TranslateService,
    public notificationService: NotificationService,
  ) {
  }

  searchedAccountsList: Account[] = [];
  searchAccountLoading = false;
  removable = true;
  addOnBlur = true;
  searchValue: any;
  selected;
  member: Account;
  clicked = false;
  @Input() statuses;
  @Input() searchBarStatus;
  @Input() publicationSlug;
  @Output() hiddenstatusChange = new EventEmitter();
  @Output() memberInvited = new EventEmitter();
  @ViewChild('tagInput') private tagInput: ElementRef;
  @ViewChild('tagInputEmail') private tagInputEmail: ElementRef;
  @Input() members;
  tags = [];
  limitUp = false;
  allTags = [];
  tagsEmail = [];
  searchText;
  email: string;
  emailExists = false;
  public keyUp = new Subject<string>();
  private unsubscribe$ = new ReplaySubject<void>(1);

  memberEmails;
  memberKeys;

  static validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  ngOnInit() {
    this.selected = this.statuses[0];
    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
          if (data.action === 'getArticlesByTerm') {
            console.log('getArticlesByTerm-error', data.message);
          }
        }
      );

    if (this.members) {
      this.memberEmails = this.members.filter(el => {
        if (el.email && !el.user) {
          return true;
        }
      }).map(
        el => el.email
      );

      this.memberKeys = this.members.filter(el => {
        if (el.user) {
          return true;
        }
      }).map(
        el => el.user.username
      );
    }


    this.keyUp.pipe(
      map(event => {
        // @ts-ignore
        return event.target.value;
      }),
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    )
      .subscribe(text => {
        this.searchAccountLoading = true;
        this.limitUp = false;
        if (text.length >= 3 && !SearchMemberComponent.validateEmail(text)) {
          this.emailExists = false;
          this.searchText = text;

          this.accountService.searchAccount(text)
            .pipe(
              takeUntil(this.unsubscribe$)
            )
            .subscribe((response: Account[]) => {
              const existingAccounts = this.tags.concat(this.memberKeys);
              response.forEach((account: Account, index: number) => {
                if (existingAccounts.includes(account.publicKey)) {
                  response.splice(index, 1);
                }
              });
              this.searchAccountLoading = false;
              this.searchedAccountsList = response;
            });
        } else {
          this.searchedAccountsList = [];
        }
      });


    setTimeout(
      () =>
        this.element.nativeElement
          .querySelector('mat-form-field')
          .classList.remove('mat-form-field-hide-placeholder'),
      20
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.searchBarStatus) {
      setTimeout(_ => {
        this.tagInput.nativeElement.focus();
        this.tagInputEmail.nativeElement.focus();
      });
    }
    if (!this.searchBarStatus) {
      this.tags = [];
      this.allTags = [];
      this.tagsEmail = [];
      this.searchedAccountsList = [];
    }
  }

  optionSelected(event) {
    this.searchValue = event.option.value;
    if (this.allTags.length <= 20) {
      this.tags.push(this.searchValue.name);
      this.allTags.push(this.searchValue);
      this.tagInput.nativeElement.value = '';
    } else {
      this.limitUp = true;
    }
    this.searchedAccountsList = [];
  }

  add(event: MatChipInputEvent): void {
    const value = event.value;
    this.emailExists = false;
    // Add our person
    if (value && SearchMemberComponent.validateEmail(value) && this.allTags.length <= 20) {
      if (this.memberEmails.length || this.tagsEmail.length) {
        const arr = this.tagsEmail.concat(this.memberEmails);
        arr.forEach(
          el => {
            if (el == value) {
              this.emailExists = true;
            }
          }
        );
        if (!this.emailExists) {
          this.tagsEmail.push(value);
          this.allTags.push(value);
        }
      } else {
        this.tagsEmail.push(value);
        this.allTags.push(value);
      }
      this.tagInput.nativeElement.value = '';

    } else if (value && !SearchMemberComponent.validateEmail(value)) {
      return;
    } else if (this.allTags.length > 20) {
      this.limitUp = true;
      return;
    }
  }


  remove(item_tag: any): void {
    const index = this.allTags.indexOf(item_tag);
    if (item_tag.firstName) {
      const indexName = this.tags.indexOf(item_tag.name);
      if (index >= 0) {
        this.allTags.splice(index, 1);
        this.tags.splice(indexName, 1);
      }
    } else {
      if (index >= 0) {
        const emailIndex = this.tagsEmail.indexOf(item_tag);
        this.allTags.splice(index, 1);
        this.tagsEmail.splice(emailIndex, 1);
      }
    }
  }

  checkImageHashExist(content) {
    const account = content ? content : '';
    const meta = account.meta ? account.meta : '';
    const image = meta.image_hash ? meta.image_hash : '';
    return !!(
      account &&
      meta &&
      image &&
      image !== '' &&
      !image.startsWith('http://127.0.0.1') &&
      image.indexOf('_thumb') !== -1
    );
  }

  checkContentImageHashExist(content) {
    const meta = content.meta ? content.meta : '';
    const image = meta.thumbnail_hash ? meta.thumbnail_hash : '';
    return !!(
      content &&
      meta &&
      image &&
      image !== '' &&
      !image.startsWith('http://127.0.0.1') &&
      image.indexOf('_thumb') !== -1
    );
  }

  addMember() {
    this.clicked = true;
    this.hiddenstatusChange.emit({hidden: true});
    const bodyNames: Array<object> = this.tags.map(
      elem => {
        return {
          publicKey: elem,
          asEditor: this.selected === 'Editor'
        };
      }
    );
    const bodyMails: Array<object> = this.tagsEmail.map(
      elem => {
        return {
          email: elem,
          asEditor: this.selected === 'Editor'
        };
      }
    );
    const body = bodyNames.concat(bodyMails);
    this.publicationService
      .addMember(body, this.publicationSlug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
          if (res.status == 204) {
            const messages = this.translateService.instant('success');
            this.notificationService.success(messages['request_sended']);
          }
          if (res.status == 200) {
            let names = '';
            this.allTags.forEach(
              el => {
                res.body.forEach((resel, index) => {
                  if (el.name == resel && index == res.body.length - 1) {
                    names += `${el.firstName} ${el.lastName} `;
                  } else if (el.name == resel && index !== res.body.length - 1) {
                    names += `${el.firstName} ${el.lastName}, `;
                  }

                });

              }
            );
            const messages = this.translateService.instant('warning');
            this.notificationService.warning(messages['publication_invitation'] + names);
          }
          this.tags = [];
          this.allTags = [];
          this.tagsEmail = [];
          this.searchedAccountsList = [];
          this.memberInvited.emit(true);
          this.clicked = false;
        },
        err => {
          const messages = this.translateService.instant('error');
          this.notificationService.error(messages['add_member_somthing_wrong']);
          // this.memberInvited.emit(true);
          this.clicked = false;
        }
      );
  }


  getAccountName(account: Account): string {
    let name = '';
    if (account.firstName && account.lastName) {
      name = account.firstName + ' ' + account.lastName;
    } else if (!account.firstName && !account.lastName) {
      name = account.publicKey;
    } else {
      name = (account.firstName ? account.firstName : '') + ' ' + (account.lastName ? account.lastName : '');
    }
    return name;
  }

  getTagName(tagInput: any) {
    if (!tagInput) {
      return '';
    }
    return (typeof tagInput == 'string') ? tagInput : this.getAccountName(tagInput);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
