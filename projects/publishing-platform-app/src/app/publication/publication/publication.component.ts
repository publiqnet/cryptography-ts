import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit, TemplateRef, Inject, PLATFORM_ID } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { debounceTime, switchMap, takeUntil, distinctUntilChanged, mergeMap, filter, delay, debounce } from 'rxjs/operators';
import { Params, ActivatedRoute } from '@angular/router';
import { Publication } from '../../core/services/models/publication';
import { ReplaySubject, Observable, observable, fromEvent, of, Subject, timer } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { PublicationService } from '../../core/services/publication.service';
import { UtilService } from '../../core/services/util.service';
import { Content } from '../../core/services/models/content';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { UiNotificationService } from '../../core/services/ui-notification.service';
import { isPlatformBrowser } from '@angular/common';
import { Account } from '../../core/services/models/account';
import { Author } from '../../core/services/models/author';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit, OnDestroy {
  public coverMenuItems = [
    {
      icon: 'reposition',
      text: 'Reposition',
      value: 'reposition',
    },
    {
      icon: 'delete',
      text: 'Delete',
      value: 'delete',
    },
    {
      icon: 'hidden',
      text: 'Hide Cover',
      value: 'hide-cover',
    },
  ];
  public pubSelectData = [
    {
      'value': '2',
      'text': 'Editor',
    },
    {
      'value': '3',
      'text': 'Contributor',
    }
  ];
  @Input('autoresize') maxHeight: number;
  @ViewChild('publicationTitle', { static: false }) set publicationTitle(el: ElementRef | null) {
    if (!el) {
      return;
    }

    this.resizeTextareaElement(el.nativeElement);
  }
  @ViewChild('publicationDescription', { static: false }) set publicationDescription(el: ElementRef | null) {
    if (!el) {
      return;
    }

    this.resizeTextareaElement(el.nativeElement);
  }
  public publicationForm: FormGroup;
  public searchForm: FormGroup;
  public isMyPublication = false;
  public editMode = false;
  public imageLoaded = false;
  public firstContentBlock = [];
  public followers = [];
  public requests = [];
  public listType = 'grid';
  public logoData = {};
  public masonryOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };
  public members = [];
  public membersOdd = [];
  public membersEven = [];
  public subscribers = [];
  public pendings = [];
  public haveResult: boolean;
  public searchedMembers = [];
  public searchedResult: boolean;
  public email = '';
  public chips = [];
  public isEmail = false;
  public activeTab = 'stories';
  public membersActiveTab = 'requests';
  public loading = true;
  articlesLoaded = false;
  public publication: Publication;
  currentUser;
  private unsubscribe$ = new ReplaySubject<void>(1);
  slug: string;
  stories: Content[] = [];
  textChanging: boolean;
  coverFile: File;
  logoFile: File;
  deleteLogo = '0';
  deleteCover = '0';
  showInviteModal: boolean = false;
  publicationDesc: string;
  temp = new Subject<any>();

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    public utilService: UtilService,
    private formBuilder: FormBuilder,
    public uiNotificationService: UiNotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    this.buildSearchForm();
    this.getPublication();

    this.temp.pipe(
      filter((res) => res.length >= 3),
      distinctUntilChanged(),
      debounce((res) => {
        if (ValidationService.isEmail(res)) {
          this.email = res;
          return timer(0);
        }
        return timer(750);
      }),
      mergeMap(
        res => {
          if (ValidationService.isEmail(res)) {
            return of([]);
          } else {
            return this.accountService.searchAccountByTerm(res);
          }
        }
      ),
    )
      .subscribe(
        res => {
          this.searchedMembers = res;
          this.searchedResult = true;
          this.haveResult = true;
        }
      );
  }

  enterTag(e) {
    if (this.email) {
      this.chips.push(this.email);
      this.email = '';
      this.searchedResult = false;
    }
  }

  removeChip(index) {
    this.chips.splice(index, 1);
  }

  suggestionSelected(e) {
    this.chips.push(e);
    this.searchedResult = false;
  }

  textChange(e) {
    this.temp.next(e);
  }

  getPublication() {
    this.route.params
      .pipe(
        debounceTime(500),
        switchMap((data: Params) => {
          this.slug = data.slug;
          return this.accountService.accountUpdated$;
        }),
        switchMap((data: any) => {
          this.currentUser = data;
          return this.publicationService.getPublicationBySlug(this.slug);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((pub: Publication) => {
        this.loading = false;
        this.publication = pub;
        console.log(this.publication);
        this.listType = this.publication.listView ? 'single' : 'grid';
        this.buildForm();
        this.isMyPublication = this.publication.memberStatus == 1;
        if (this.isMyPublication) {
          this.requests = this.publication.requests;
          this.pendings = this.publication.invitations;
          this.subscribers = this.publication.subscribers;
          this.members = this.publication.editors.concat(this.publication.contributors);
          this.membersOdd = [];
          this.membersEven = [];
          this.members.unshift(this.publication.owner);
          this.members.forEach(
            (el, i) => {
              if (i == 0 || i % 2 == 0) {
                this.membersOdd.push(el);
              } else {
                this.membersEven.push(el);
              }
            }
          );
        } else {
          this.publicationForm.disable();
        }
        if (this.publication.logo) {
          this.logoData = {
            image: this.publication.logo
          };
        }
        this.getPublicationStories();
      });

  }

  resizeTextareaElement(el: HTMLElement) {
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

  inviteModal(flag: boolean) {
    this.showInviteModal = flag;
  }

  invite() {
    const memberArray = this.chips.map(
      el => {
        return {
          email: el.publicKey ? null : el,
          publicKey: el.publicKey ? el.publicKey : null,
          asEditor: this.searchForm.value.status == '2'
        };
      }
    );
    this.publicationService.inviteBecomeMember(memberArray, this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        res => {
          this.showInviteModal = false;
          // chiperic heto poxel
          this.chips = [];
          this.getPublication();
        }
      );
  }

  follow() {
    this.publicationService.follow(this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        () => this.publication.following = !this.publication.following
      );
  }

  followMember(e, user: Account) {
    if (e.follow) {
      this.accountService.follow(user.publicKey).subscribe(
        res => {
          user.subscribed = true;
        }
      );
    } else {
      this.accountService.unfollow(user.publicKey).subscribe(
        res => {
          user.subscribed = false;
        }
      );
    }

  }

  becomeMember() {
    if (this.publication.memberStatus == 0) {
      this.publicationService.requestBecomeMember(this.publication.slug)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          () => {
            this.publication.memberStatus = 203;
          }
        );
    } else {
      this.publicationService.cancelBecomeMember(this.publication.slug)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          () => {
            this.publication.memberStatus = 0;
          }
        );
    }
  }

  setEditMode(mode = true) {
    this.activeTab = 'stories';
    this.editMode = mode;
    this.textChanging = false;
    if (!mode) {
      this.publicationForm.controls['title'].setValue(this.publication.title);
      this.publicationForm.controls['description'].setValue(this.publication.description);
      this.listType = this.publication.listView ? 'single' : 'grid';
      this.logoData = {
        image: this.publication.logo
      };
    }
  }

  uploadCover(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (loadEvent: any) => {
        this.imageLoaded = true;
        this.coverFile = input.files[0];
        this.edit();
      };
      myReader.readAsDataURL(input.files[0]);
    }
  }

  uploadLogo(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (loadEvent: any) => {
        this.imageLoaded = true;
        this.logoFile = input.files[0];
        this.logoData = {
          image: loadEvent.target.result
        };
        this.edit();
      };
      myReader.readAsDataURL(input.files[0]);
    }
  }

  getPublicationStories() {
    this.publicationService
      .getPublicationStories(this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: { data: Content[], more: boolean }) => {
        this.stories = data.data;
      });
  }

  changeListType(type) {
    this.listType = type;
  }

  edit() {
    const formData = new FormData();
    formData.append('title', this.publicationForm.value.title);
    formData.append('description', this.publicationForm.value.description);
    if (this.coverFile) {
      formData.append('cover', this.coverFile);
    }
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
    formData.append('deleteLogo', this.deleteLogo);
    formData.append('deleteCover', this.deleteCover);
    formData.append('hideCover', this.publication.hideCover ? 'true' : '');
    formData.append('listView', this.listType == 'grid' ? '' : 'true');
    formData.append('tags', this.publication.tags.join(','));
    // formData.append('tags', this.listType == 'grid' ? '' : 'true');
    this.publicationService.editPublication(formData, this.publication.slug).subscribe(
      (result: Publication) => {
        this.editMode = false;
        this.textChanging = false;
        this.imageLoaded = false;
        this.publication = result;
        this.uiNotificationService.success('Success', 'Your publication successfully updated');
      },
      err => {
        this.editMode = false;
        this.textChanging = false;
        this.imageLoaded = false;
        this.uiNotificationService.error('Error', err.error.content);
      }
    );
  }

  onTitleChange(event) {
    if (event.target) {
      this.resizeTextareaElement(event.target);
    }
    this.textChanging = true;
    this.publicationForm.controls['title'].setValue(event.target.value);
  }

  onDescriptionChange(event) {
    if (event.target) {
      this.resizeTextareaElement(event.target);
    }
    this.textChanging = true;
    this.publicationDesc = event.target.value;
    if (this.publicationDesc.trim().length && (this.publicationDesc !== this.publication.description)) {
      this.publicationForm.controls['description'].setValue(this.publicationDesc);
    } else if (!this.publicationDesc.trim().length) {
      this.publicationForm.controls['description'].setValue('');
    }
    this.publicationForm.controls['description'].setValue(event.target.value);
  }

  dropdownSelect($event) {
    if ($event == 'delete') {
      this.deleteCover = '1';
      this.coverFile = null;
      this.edit();
    }
    if ($event == 'hide-cover') {
      this.publication.hideCover = 'true';
      this.edit();
    }
  }

  showCover() {
    this.publication.hideCover = '';
    this.edit();
  }

  removeLogo() {
    this.deleteLogo = '1';
    this.logoFile = null;
    this.publication.logo = '';
    this.logoData = {};
    this.edit();
  }

  onRoleClick(e, member) {
    this.publicationService.changeMemberStatus(this.publication.slug, {
      publicKey: member.publicKey,
      status: e.slug
    }).subscribe(
      () => { }
    );
  }

  onUserClick(e) {
    this.utilService.routerChangeHelper('account', e.user.publicKey);
  }

  onFollowChange(e) {
    // console.log(e);
  }

  answerRequest(e, action, index) {
    this.publicationService.acceptRejectRequest(this.publication.slug, e.user.publicKey, action).subscribe(
      res => {
        if (action == 'accept') {
          e.user.memberStatus = 3;
          this.members.length % 2 == 0 ? this.membersOdd.push(e.user) : this.membersEven.push(e.user);
        }
        this.requests.splice(index, 1);
      }
    );
  }

  cancelInvitation(e, i) {
    this.publicationService.cancelInvitationBecomeMember(this.publication.slug, e.user.publicKey).subscribe(
      res => {
        this.pendings.splice(i, 1);
      }
    );
  }

  removeFromPublication(e, member: Author) {
    this.publicationService.deleteMember(this.publication.slug, member.publicKey).subscribe(
      () => {
        this.getPublication();
      }
    );
  }

  private buildForm() {
    this.publicationForm = this.formBuilder.group({
      title: new FormControl(this.publication.title, [Validators.required]),
      description: new FormControl(this.publication.description, []),
      tags: new FormControl(this.publication.tags, [])
    },
      { validator: ValidationService.noSpaceValidator }
    );
  }

  private buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      status: new FormControl(null, [Validators.required]),
      members: new FormControl('', []),
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.articlesLoaded = false;
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
