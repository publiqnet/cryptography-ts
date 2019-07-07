import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';

import { TranslateService } from '@ngx-translate/core';
import { Subject, ReplaySubject, of } from 'rxjs';
import { map, debounceTime, takeUntil, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { AccountService } from '../../core/services/account.service';
import { ErrorService, ErrorEvent } from '../../core/services/error.service';
import { PublicationService } from '../../core/services/publication.service';
import { NotificationService } from '../../core/services/notification.service';
import { Account } from '../../core/services/models/account';
import { Publication } from '../../core/services/models/publication';
import { PublicationMemberStatusType } from '../../core/models/enumes';
import { HttpResponse } from '@angular/common/http';

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

  removable = true;
  addOnBlur = true;
  searchValue: any;
  member: Account;
  clicked = false;
  @Input() searchBarStatus;
  // @Input() publicationSlug;
  @Output() hiddenStatusChange = new EventEmitter();
  @Output() memberInvited = new EventEmitter();
  @ViewChild('tagInput', {static: false}) private tagInput: ElementRef;
  @ViewChild('tagInputEmail', {static: false}) private tagInputEmail: ElementRef;
  // @Input() members;
  tags = [];
  limitUp = false;
  allTags = [];
  tagsEmail = [];
  searchText;
  email: string;
  emailExists = false;
  memberEmails;
  memberKeys;

  public keyUp = new Subject<KeyboardEvent>();
  private unsubscribe$ = new ReplaySubject<void>(1);
  searchedAccountsList: Account[] = [];
  searchAccountLoading = false;
  @Input() publication: Publication;
  members: Account[];
  selected;
  statuses;


  static validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  ngOnInit() {
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

    // @ts-ignore
    this.keyUp.pipe(
      map((event: KeyboardEvent): string => {
        // @ts-ignore
        return event.target.value;
      }),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.searchAccountLoading = true;
        this.limitUp = false;
      }),
      switchMap((term: string) => {
        if (term.length >= 3 && !SearchMemberComponent.validateEmail(term)) {
          this.emailExists = false;
          this.searchText = term;
          return this.accountService.searchAccountByTerm(term);
        }

        return of([]);
      }),
      takeUntil(this.unsubscribe$)
    )
      .subscribe((accounts: Account[]) => {
        if (accounts.length) {
          const existingAccounts = this.tags.concat(this.memberKeys);
          accounts.forEach((account: Account, index: number) => {
            if (existingAccounts.includes(account.publicKey)) {
              accounts.splice(index, 1);
            }
          });
          this.searchAccountLoading = false;
          this.searchedAccountsList = accounts;
        } else {
          this.searchedAccountsList = [];
        }
      });

    /*.subscribe((text: string) => {
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
    });*/


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

    if (('publication' in changes) && this.publication) {
      this.statuses = (this.publication.memberStatus === this.MemberStatus.owner) ?
        [{name: 'Contributor', value: this.MemberStatus.contributor}, {name: 'Editor', value: this.MemberStatus.editor}] :
        [{name: 'Contributor', value: this.MemberStatus.contributor}];

      this.selected = this.statuses[0].value;
      this.members = this.publication.contributors.concat(this.publication.editors).concat(this.publication.owner);

      if (this.members.length > 0) {
        this.memberEmails = this.members
          .filter((account: Account) => account.email && !account.publicKey)
          .map(el => el.email);

        this.memberKeys = this.members
          .filter((account: Account) => account.publicKey)
          .map(el => el.publicKey);
      }
    }
  }

  get MemberStatus() {
    return PublicationMemberStatusType;
  }

  optionSelected(event) {
    this.searchValue = event.option.value;
    if (this.allTags.length <= 20) {
      this.tags.push(this.searchValue.publicKey);
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
        arr.forEach(el => {
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

  checkImageHashExist(account: Account) {
    return !!(
      account &&
      account.image &&
      account.image !== '' &&
      !account.image.startsWith('http://127.0.0.1') &&
      account.image.indexOf('_thumb') !== -1
    );
  }

  /*

    addMember() {
      this.clicked = true;
      this.hiddenStatusChange.emit({hidden: true});
      const isEditor = this.selected === this.MemberStatus.editor;
      const bodyNames: Array<object> = this.tags.map(
        elem => {
          return {
            publicKey: elem,
            asEditor: isEditor
          };
        }
      );
      const bodyMails: Array<object> = this.tagsEmail.map(
        elem => {
          return {
            email: elem,
            asEditor: isEditor
          };
        }
      );
      const body = bodyNames.concat(bodyMails);
      this.publicationService
        .addMember(body, this.publication.slug)
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

  */

  inviteBecomeMember() {
    this.clicked = true;
    this.hiddenStatusChange.emit({hidden: true});
    const isEditor = this.selected === this.MemberStatus.editor;
    const bodyNames: object[] = this.tags.map(elem => {
        return {email: '', publicKey: elem, asEditor: isEditor};
      }
    );
    const bodyMails: object[] = this.tagsEmail.map(elem => {
        return {email: elem, publicKey: '', asEditor: isEditor};
      }
    );
    const body = bodyNames.concat(bodyMails);

    this.publicationService
      .inviteBecomeMember(body, this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
          if (res.status == 204) {
            const messages = this.translateService.instant('success');
            this.notificationService.success(messages['request_sended']);
          } else if (res.status == 200) {
            let names = '';
            this.allTags.forEach(el => {
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
        () => {
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
