import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Optional,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ContentChild, HostListener
} from '@angular/core';
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
import { style } from '@angular/animations';
import { CryptService } from '../../core/services/crypt.service';

enum ModalConfirmActions {
    DeleteOne,
    DeleteAll
}

enum ModalTitles {
    DeleteOneDraft = 'Are you sure you want to delete this draft?',
    DeleteAllDrafts = 'Are you sure you want to delete all drafts?'
}

@Component({
    selector: 'app-author',
    templateUrl: './author.component.html',
    styleUrls: ['./author.component.scss'],
    providers: [SafeStylePipe]
})
export class AuthorComponent implements OnInit, OnDestroy {

    public isMasonryLoaded = false;

    bioTextElement: ElementRef;
    authorNameElement: ElementRef;

    @ViewChild('authorName', {static: false}) set authorName(el: ElementRef | null) {
        if (!el) {
            return;
        }

        this.authorNameElement = el;
        this.resizeTextareaElement(el.nativeElement);
    }

    @ViewChild('bioText', {static: false}) set bioText(el: ElementRef | null) {
        if (!el) {
            return;
        }

        this.bioTextElement = el;
        this.resizeTextareaElement(el.nativeElement);
    }

    @Input('autoresize') maxHeight: number;
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
    editTitleIcon: boolean = false;
    editBioIcon: boolean = false;
    disableSave: boolean = false;
    showPrivateKey: boolean = false;
    showPhase: boolean = false;
    showModal: boolean = false;
    showSecurityModal: boolean = false;
    protected password: string = '';
    passwordVerified = false;
    decriptedPrivateKey: string;
    passError = '';
    incorrectRecoverPhrase = '';
    public decryptedBrainKey: string;
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
            'text': 'Edit stories',
            'active': false
        },
        {
          'value': '4',
          'text': 'Security',
          'active': false
        }
    ];
    author: Account;
    currentImage: string;
    fullName: string;
    firstName: string;
    lastName: string;
    bio: string;
    photo: File;
    editMode: boolean = false;
    modalProps: any = {};

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
        public cryptService: CryptService,
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
                    this.bio = this.author.bio;
                    this.listType = this.author.listView ? 'single' : 'grid';
                    this.bio = this.author.bio || 'Write a short bio';
                    this.fullName = this.author.fullName;
                    if (this.author.image) {
                        this.avatarUrl = this.author.image;
                    }
                    this.shortName = this.author.shortName ? this.author.shortName : '';
                    this.canFollow = !this.author.subscribed;
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

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {}

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
            {validator: ValidationService.noSpaceValidator}
        );
    }

    resizeTextareaElement(el) {
        let newHeight;
        if (el) {
            el.style.overflow = 'hidden';
            el.style.height = 'auto';
            if (this.maxHeight) {
                newHeight = Math.min(el.scrollHeight, this.maxHeight);
            } else {
                newHeight = el.scrollHeight;
            }
            el.style.height = newHeight + 'px';
        }
    }


    onNameEdit(event) {
        if (event.target) {
            this.resizeTextareaElement(event.target);
        }
        this.editTitleIcon = true;
        this.showEditModeIcons = true;
        this.fullName = event.target.value;
        if (this.fullName == this.author.fullName) {
            this.editTitleIcon = false;
            this.showEditModeIcons = false;
        }
        const splittedFullName = this.fullName.split(' ').filter(item => item);
        this.firstName = (splittedFullName.length > 1) ? splittedFullName.slice(0, -1).join(' ') : splittedFullName.slice(-1).join(' ');
        this.lastName = (splittedFullName.length > 1) ? splittedFullName.slice(-1).join(' ') : '';
        if (this.fullName != this.author.fullName) {
            this.authorForm.controls['firstName'].setValue(this.firstName);
            this.authorForm.controls['lastName'].setValue(this.lastName);
        }
    }

    onFollowClick(event) {
        event.preventDefault();
        console.log('Follow Clicked');
    }

    onBioEdit(event) {
        this.showEditModeIcons = true;
        this.editBioIcon = true;
        if (event.target) {
            this.resizeTextareaElement(event.target);
        }
        this.bio = event.target.value;
        if (this.bio == this.author.bio) {
            this.editBioIcon = false;
            this.showEditModeIcons = false;
        }
        if (this.bio.trim().length && (this.bio !== this.author.bio)) {
            this.authorForm.controls['bio'].setValue(this.bio);
        } else if (!this.bio.trim().length) {
            this.authorForm.controls['bio'].setValue('');
        }
    }

    resetValues() {
        if (this.bioTextElement) {
            this.bioTextElement.nativeElement.value = this.author.bio;
        }

        if (this.authorNameElement) {
            this.authorNameElement.nativeElement.value = this.author.fullName;
        }

        this.currentImage = this.author.image;
        this.authorForm.controls['firstName'].setValue(this.author.firstName);
        this.authorForm.controls['lastName'].setValue(this.author.lastName);
        this.authorForm.controls['bio'].setValue(this.author.bio);
        this.listType = this.author.listView ? 'single' : 'grid';
        this.editMode = false;
        this.showEditModeIcons = false;
        this.showEditIcon = false;
        this.showEditIcon1 = false;
        this.editTitleIcon = false;
        this.editBioIcon = false;
    }

    resetCurrentImage() {
        this.currentImage = this.author.image;
    }

    tabChange(e) {
        this.selectedTab = e;
        if (e == 2 && !this.drafts) {
            this.loading = true;
            this.getDrafts();
        }
    }

    onEditMode(flag: boolean, fullName?, bio?) {
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
        const title = ModalTitles.DeleteOneDraft;
        this.modalProps = {action: ModalConfirmActions.DeleteOne.toString(), title, slug: id, index};
        this.showModal = !this.showModal;
    }

    editDraft(id: string) {
        this.router.navigate([`/content/editdraft/${id}`]);
    }

    deleteAllDrafts() {
        const title = ModalTitles.DeleteAllDrafts;
        this.modalProps = {action: ModalConfirmActions.DeleteAll.toString(), title};
        this.showModal = !this.showModal;
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
        this.showEditModeIcons = true;
        const input = event.target;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                if (e && e.target) {
                    this.currentImage = e.target.result;
                    this.photo = input.files[0];
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

        formData.append('firstName', this.authorForm.controls['firstName'].value ? this.authorForm.controls['firstName'].value : '');
        formData.append('lastName', this.authorForm.controls['lastName'].value ? this.authorForm.controls['lastName'].value : '');
        formData.append('bio', this.authorForm.controls['bio'].value ? this.authorForm.controls['bio'].value : '');
        formData.append('listView', (this.listType == 'single') ? 'true' : '');

        this.accountService.updateAccount(formData)
            .subscribe(data => {
                this.editMode = false;
                this.editTitleIcon = false;
                this.editBioIcon = false;
                this.showEditModeIcons = false;
            });
    }

    doDelete(data) {
        if (!data.answer) {
            this.showModal = !this.showModal;
            return;
        }
        if (data.properties.action == ModalConfirmActions.DeleteOne.toString()) {
            this.doDeleteOneDraft(data.properties);
        } else {
            this.doDeleteAllDrafts(data.properties);
        }
        this.showModal = !this.showModal;
    }

    private doDeleteOneDraft(props) {
        if (!props['slug']) { return; }

        this.draftService.delete(props['slug'])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                if (this.drafts && props['index'] in this.drafts) {
                    this.drafts.splice(props['index'], 1);
                }
            });
    }

    private doDeleteAllDrafts(props) {
        this.loading = true;
        this.draftService.deleteAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.drafts = [];
                this.loading = false;
            });
    }

  openPopup(flag: boolean, type?: number) {
    this.showSecurityModal = flag;
    if (this.showSecurityModal == false) {
      this.passwordVerified = false;
      this.passError = '';
      this.password = '';
    }
    if (type == 1) {
      this.showPrivateKey = true;
      this.showPhase = false;
    } else if (type == 2) {
      this.showPhase = true;
      this.showPrivateKey = false;
    }
  }

  passwordValidator() {
    if (this.password) {
      return false;
    } else {
      return true;
    }
  }

  generatePrivateKey() {
    this.decryptPK(this.accountService.brainKeyEncrypted);
  }

  decryptPK(brainKeyEncrypted) {
    if (this.cryptService.checkPassword(brainKeyEncrypted, this.password)) {
      const brainKey = this.cryptService.getDecryptedBrainKey(brainKeyEncrypted, this.password);
      this.decriptedPrivateKey = this.cryptService.getPrivateKey(brainKey);
    }

    if (this.decriptedPrivateKey) {
      this.passwordVerified = true;
    } else {
      this.passError = 'Incorrect Password';
      this.passwordVerified = false;
    }
  }

  focusFunction() {
    this.passError = '';
    this.incorrectRecoverPhrase = '';
  }

  generateBK() {
    this.decryptBK(this.accountService.brainKeyEncrypted);
  }

  decryptBK(brainKeyEncrypted) {
    if (this.cryptService.checkPassword(brainKeyEncrypted, this.password)) {
      this.decryptedBrainKey = this.cryptService.getDecryptedBrainKey(brainKeyEncrypted, this.password);
      this.passwordVerified = true;
    } else {
      this.passError = 'Incorrect Password';
      this.passwordVerified = false;
    }
  }

  public keyupFunc(event: KeyboardEvent, callBackFunc: string): void {
    this.focusFunction();
    if ((event.code === 'Enter' || event.code === 'NumpadEnter') && !this.passwordValidator() && callBackFunc !== '') {
      this[callBackFunc]();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.articlesLoaded = false;
      this.isCurrentUser = false;
      this.passwordVerified = false;
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
