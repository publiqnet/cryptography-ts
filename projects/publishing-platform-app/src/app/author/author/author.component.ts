import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Account } from '../../core/services/models/account';
import { NotificationService } from '../../core/services/notification.service';
import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { Content } from '../../core/services/models/content';
import { DialogService } from '../../core/services/dialog.service';
import { ContentService } from '../../core/services/content.service';
import { DraftService } from '../../core/services/draft.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { UtilService } from '../../core/services/util.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { SafeStylePipe } from '../../core/pipes/safeStyle.pipe';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
  providers: [SafeStylePipe]
})
export class AuthorComponent implements OnInit, OnDestroy {

  public isMasonryLoaded = false;
  public masonryOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };
  showEditIcon = false;
  showEditIcon1 = false;
  showEditModeIcons = false;
  private authorId: string;
  shortName;
  loadingAuthor = true;
  avatarUrl: string;
  canFollow = true;
  isCurrentUser = false;
  articlesLoaded = false;
  public publishedContent: Content[] = [];
  public loading = true;
  listType = 'grid';
  public drafts: Array<any>;
  private unsubscribe$ = new ReplaySubject<void>(1);
  selectedTab: string = '1';
  public blockInfiniteScroll = false;
  public seeMoreChecker = false;
  seeMoreLoading = false;
  public startFromUri = null;
  public storiesDefaultCount = 4;
  authorForm: FormGroup;
  tabs = [
    {
      'value': '1',
      'text': 'Stories',
      'active': true
    },
    {
      'value': '2',
      'text': 'Drafts',
      'active': false
    },
    {
      'value': '3',
      'text': 'Settings',
      'active': false
    }
  ];
  author: Account;
  currentImage: string;
  fullName: String;
  firstName: String;
  lastName: String;
  bio: String;
  photo: File;
  editMode: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notification: NotificationService,
    private accountService: AccountService,
    public dialogService: DialogService,
    private errorService: ErrorService,
    private contentService: ContentService,
    private draftService: DraftService,
    public utilService: UtilService,
    private formBuilder: FormBuilder,
    private safeStylePipe: SafeStylePipe,
    protected sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        debounceTime(500),
        switchMap((params: Params) => {
          this.authorId = params['id'];
          return this.accountService.accountUpdated$;
        }),
        switchMap((data: any) => {
          if (this.authorId === 'undefined') {
            this.router.navigate(['/']);
            return;
          }
          return this.accountService.getAuthorByPublicKey(this.authorId);
        }),
        switchMap((author: Account) => {
          this.author = author;
          this.firstName = this.author.firstName;
          this.lastName = this.author.lastName;
          this.listType = this.author.listView ? 'single' : 'grid';
          this.bio = this.author.bio || 'Write a short bio';
          this.fullName = this.author.fullName;
          if (this.author.image) {
            this.avatarUrl = this.author.image;
          }
          this.shortName = this.author.shortName ? this.author.shortName : '';
          this.canFollow = this.author.isSubscribed == 0 || this.author.isSubscribed == -1;
          this.loadingAuthor = false;
          this.articlesLoaded = true;
          if (this.accountService.loggedIn() && this.author && this.accountService.accountInfo.publicKey == this.author.publicKey) {
            this.isCurrentUser = true;
            this.setAuthorName();
            return this.contentService.getMyContents(this.startFromUri, this.storiesDefaultCount);
          } else {
            return this.contentService.getContents(this.authorId, this.startFromUri, this.storiesDefaultCount);
          }

        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contents: any) => {
        this.publishedContent = this.publishedContent.concat(contents.data);
        this.seeMoreChecker = contents.more;
        this.seeMoreLoading = false;
        this.calculateLastStoriUri();
        this.buildForm();
      }, error => this.errorService.handleError('loadAuthorData', error));

    this.accountService.followAuthorChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.accountService.getAuthorByPublicKey(this.author.publicKey);
        this.canFollow = false;
      });

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
        if (data.action === 'loadAuthorData') {
          this.router.navigate(['/page-not-found']);
        } else if (data.action == 'loadAuthorStories') {
          console.log('--error--', data.message);
        } else if (['getUserDrafts', 'deleteDraft', 'deleteAllDrafts'].includes(data.action)) {
          this.notification.error(data.message);
        }
      }
      );
  }

  private buildForm() {
    this.firstName = this.author.firstName;
    this.lastName = this.author.lastName;
    this.bio = this.author.bio;

    if (this.author.image) {
      this.currentImage = this.author.image;
    }

    this.authorForm = this.formBuilder.group({
      firstName: new FormControl(this.firstName, []),
      lastName: new FormControl(this.lastName, []),
      bio: new FormControl(this.bio, [])
    },
      { validator: ValidationService.noSpaceValidator }
    );
  }

  fullNameChange(event) {
    this.fullName = event.target.textContent;
    const splittedFullName = this.fullName.split(' ');
    this.firstName = splittedFullName.slice(0, -1).join(' ');
    this.lastName = splittedFullName.slice(-1).join(' ');
    this.authorForm.controls['firstName'].setValue(this.firstName);
    this.authorForm.controls['lastName'].setValue(this.lastName);
    this.showEditModeIcons = true;
  }

  // onEditTitle(data: string) {
  //   if (data == 'h1') {
  //     this.showEditIcon = true;
  //   } else if (data == 'h3') {
  //     this.showEditIcon1 = true;
  //   } else {
  //     this.showEditIcon = false;
  //     this.showEditIcon1 = false;
  //   }
  //   this.showEditModeIcons = true;
  // }

  changeBio(event) {
    this.bio = event.target.textContent;
    this.authorForm.controls['bio'].setValue(this.bio);
    this.showEditModeIcons = true;
  }

  tabChange(e) {
    this.selectedTab = e;
    if (e == 2 && !this.drafts) {
      this.loading = true;
      this.getDrafts();
    }
  }

  onEditMode(flag: boolean, fullName?, bio? ) {
    this.listType = this.author.listView ? 'single' : 'grid';
    this.editMode = flag;
    this.showEditModeIcons = false;
    this.showEditIcon = false;
    this.showEditIcon1 = false;
    console.log(flag);
    if (!flag) {
      fullName.textContent = this.setAuthorName();
      bio.textContent = this.author.bio || 'Write a short bio';
    }
  }

  getDrafts() {
    this.draftService.getUserDrafts()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((drafts) => {
        this.drafts = drafts;
        this.loading = false;
      });
  }

  deleteDraft(id: number, index: number) {
    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        switchMap(() => this.draftService.delete(id)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        if (this.drafts && index in this.drafts) {
          this.drafts.splice(index, 1);
        }
      });
  }

  editDraft(id: string) {
    this.router.navigate([`/content/editdraft/${id}`]);
  }

  deleteAllDrafts() {
    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        tap(() => this.loading = true),
        switchMap(() => this.draftService.deleteAll()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.drafts = [];
        this.loading = false;
      });
  }

  onLayoutComplete(event) {
    if (event && event.length > 1) {
      this.isMasonryLoaded = true;
    }
  }

  calculateLastStoriUri() {
    if (this.publishedContent.length) {
      const lastIndex = this.publishedContent.length - 1;
      if (this.publishedContent[lastIndex].uri !== this.startFromUri) {
        this.startFromUri = this.publishedContent[lastIndex].uri;
      }
    }
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.blockInfiniteScroll = true;
    const contentObservable = this.isCurrentUser ? this.contentService.getMyContents(this.startFromUri, this.storiesDefaultCount) : this.contentService.getContents(this.authorId, this.startFromUri, this.storiesDefaultCount);
    contentObservable.pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        (data: any) => {
          this.seeMoreChecker = data.more;
          this.seeMoreLoading = false;
          this.publishedContent = this.publishedContent.concat(data.data);
          this.calculateLastStoriUri();
          this.blockInfiniteScroll = false;
        }
      );
  }

  setAuthorName() {
    this.fullName = (this.author.fullName == '') ? ((this.isCurrentUser) ? 'Add your name' : '') : this.author.fullName;
    return this.fullName;
  }

  showUploadedImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (e && e.target) {
          this.currentImage = e.target.result;
          this.photo = input.files[0];
          // if (this.photo) {
          // this.reseting = false;
          // if (this.accountService.accountInfo.firstName === '' ||
          //   this.authorForm.controls['firstName'].value &&
          //   this.authorForm.controls['firstName'].value.trim() !== '') {
          // this.disableSaveBtn = false;
          // }
          // }
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  getCurrentImage() {
    const profileImage = this.currentImage ? this.currentImage : '/assets/no-image-article.jpg';
    return this.sanitizer.bypassSecurityTrustUrl(profileImage);
  }

  onSubmit() {
    if (this.authorForm.invalid) {
      return;
    }

    const formData = new FormData();
    if (this.photo) {
      formData.append('image', this.photo, this.photo.name);
    }
    formData.append('firstName', this.authorForm.controls['firstName'].value);
    formData.append('lastName', this.authorForm.controls['lastName'].value);

    formData.append('bio', this.authorForm.controls['bio'].value);
    formData.append('listView', (this.listType == 'single') ? 'true' : '');

    this.accountService.updateAccount(formData)
      .subscribe(data => {
        this.editMode = false;
        this.showEditModeIcons = false;
        // this.disableSaveBtn = true;
        // const message = this.translationService.instant('success');
        // this.notification.success(message['account_updated']);
      });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.articlesLoaded = false;
      this.isCurrentUser = false;
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
