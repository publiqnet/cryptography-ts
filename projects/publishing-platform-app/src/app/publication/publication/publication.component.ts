import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { debounceTime, switchMap, takeUntil, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { Publication } from '../../core/services/models/publication';
import { ReplaySubject } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { PublicationService } from '../../core/services/publication.service';
import { Title } from '@angular/platform-browser';
import { UtilService } from '../../core/services/util.service';
import { Content } from '../../core/services/models/content';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { UiNotificationService } from '../../core/services/ui-notification.service';


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
  haveResult: boolean;
  searchedMembers = [];
  public activeTab = 'stories';
  public membersActiveTab = 'requests';
  loading = true;
  articlesLoaded = false;
  publication: Publication;
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

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    public utilService: UtilService,
    private formBuilder: FormBuilder,
    public uiNotificationService: UiNotificationService,
  ) {
  }

  ngOnInit() {
    this.buildSearchForm();
    this.searchForm.controls['members'].valueChanges
      .pipe(
        debounceTime(750),
        distinctUntilChanged(),
        mergeMap(
          res => this.accountService.searchAccountByTerm(res)
        ))
      .subscribe(
        res => {
          this.searchedMembers = res;
          this.haveResult = true;
        }
      );

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
        this.listType = this.publication.listView ? 'single' : 'grid';
        this.buildForm();
        this.isMyPublication = this.publication.memberStatus == 1;
        if (this.isMyPublication) {
          this.requests = this.publication.requests;
          this.pendings = this.publication.invitations;
          this.subscribers = this.publication.subscribers;
          this.members = this.publication.editors.concat(this.publication.contributors);
          this.members.unshift(this.publication.owner);
          this.members.forEach(
            (el, i) => {
              if (i == 0 || i % 2 == 0) {
                this.membersOdd.push(el);
              } else if (i !== 0 && i % 2 !== 0) {
                this.membersEven.push(el);
              }
            }
          );
        }
        this.getPublicationStories();
        if (this.publication.logo) {
          this.logoData = {
            image: this.publication.logo
          };
        }
      });
  }

  inviteModal(flag: boolean) {
    this.showInviteModal = flag;
  }

  invite() {
    const body = [{
      publicKey: this.searchedMembers[0].publicKey,
      email: this.searchedMembers[0].email,
      asEditor: this.searchForm.value.status == '2'
    }];
    this.publicationService.inviteBecomeMember(body, this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        res => {
          this.showInviteModal = false;
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

  becomeMember() {
    this.publicationService.requestBecomeMember(this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        () => {
          this.publication.memberStatus = 203;
        }
      );
  }
  cancelBecomeMember() {
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

  setEditMode(mode = true, title, description) {
    this.activeTab = 'stories';
    this.editMode = mode;
    this.textChanging = false;
    if (!mode) {
      title.innerHTML = this.publication.title;
      description.innerHTML = this.publication.description;
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
        // container.style.backgroundImage = `url('${loadEvent.target.result}')`;
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
    formData.append('hideCover', this.publication.hideCover);
    formData.append('listView', this.listType == 'grid' ? '' : 'true');
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

  onTitleChange(e) {
    this.textChanging = true;
    this.publicationForm.controls['title'].setValue(e.target.textContent);
  }

  onDescriptionChange(e) {
    this.textChanging = true;
    this.publicationForm.controls['description'].setValue(e.target.textContent);
  }

  dropdownSelect($event) {
    if ($event == 'delete') {
      this.deleteCover = '1';
      this.coverFile = null;
      this.edit();
    }
    if ($event == 'hide-cover') {
      this.publication.hideCover = true;
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
  }

  onRoleClick(e, member) {
    this.publicationService.changeMemberStatus(this.publication.slug, {
      publicKey: member.publicKey,
      status: e.slug
    });
  }

  onUserClick(e, member) {
    this.utilService.routerChangeHelper('account', member.publicKey);
  }

  private buildForm() {
    // this.firstName = this.author.firstName;
    // this.lastName = this.author.lastName;
    // this.bio = this.author.bio;
    this.publicationForm = this.formBuilder.group({
      title: new FormControl(this.publication.title, []),
      description: new FormControl(this.publication.description, []),
    },
      { validator: ValidationService.noSpaceValidator }
    );
  }

  private buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      status: new FormControl('', []),
      members: new FormControl('', []),
    });
  }

  ngOnDestroy() {

  }
}
