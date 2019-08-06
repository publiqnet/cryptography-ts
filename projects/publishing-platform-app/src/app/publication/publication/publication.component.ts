import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { Publication } from '../../core/services/models/publication';
import { ReplaySubject } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { PublicationService } from '../../core/services/publication.service';
import { Title } from '@angular/platform-browser';
import { UtilService } from '../../core/services/util.service';
import { Content } from '../../core/services/models/content';


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

  public activeTab = 'stories';
  public membersActiveTab = 'requests';
  loading = true;
  articlesLoaded = false;
  publication: Publication;
  currentUser;
  private unsubscribe$ = new ReplaySubject<void>(1);
  slug: string;
  userPublications: Array<Publication>;
  stories: Content[];
  textChanging: boolean;
  coverFile: File;
  logoFile: File;
  deleteLogo = '0';
  deleteCover = '0';

  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    public utilService: UtilService
  ) {
    this.b();
  }

  b() {
    for (let i = 0; i < 20; ++i) {
      this.firstContentBlock.push({
        'uri': '5ceb9fc82765246c6cc55b47',
        'author': {
          'slug': '1.0.2',
          'first_name': 'Gohar',
          'last_name': 'Avetisyan',
          'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
        },
        'created': 1563889376,
        'published': 1563889376,
        'title': 'In the flesh: translating 2d scans into 3d prints',
        'tags': [
          '2017',
          'DEVELOPER',
          'FULLSTACK'
        ],
        'image': 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        'publication': {
          'title': 'UX Planet',
          'slug': 'ux_planet'
        },
        'view_count': '1K'
      });

      this.followers.push({
        'user': {
          'image': 'http://via.placeholder.com/120x120',
          'first_name': 'John',
          'last_name': 'Doe',
          'fullName': 'John Doe'
        },
        'isFollowing': false,
        'slug': 'user_data'
      });

      this.requests.push({
        'user': {
          'image': 'http://via.placeholder.com/120x120',
          'first_name': 'John',
          'last_name': 'Doe',
          'fullName': 'John Doe'
        },
        'isFollowing': false,
        'slug': 'user_data'
      });
    }
  }

  setEditMode(mode = true, title, description) {
    this.activeTab = 'stories';
    this.editMode = mode;
    this.textChanging = false;
    if (!mode) {
      title.innerHTML = this.publication.title;
      description.innerHTML = this.publication.description;
      this.logoData = {
        image: this.publication.logo
      };
    }
  }

  ngOnInit() {
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
        this.isMyPublication = this.publication.owner.memberStatus == 1;
        this.getPublicationStories();
        if (this.publication.logo) {
          this.logoData = {
            image: this.publication.logo
          };
        }
        console.log(this.publication);
      });
  }

  uploadCover(event, container) {
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

  uploadLogo(event, container) {
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
      .getPublicationArticles(this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((stories: Content[]) => {
        console.log(stories);
        this.stories = stories;
      });
  }

  saveEdition(title, description) {
    this.publication.title = title;
    this.publication.description = description;
    this.edit();
  }

  edit() {
    const formData = new FormData();
    formData.append('title', this.publication.title);
    formData.append('description', this.publication.description);
    if (this.coverFile) {
      formData.append('cover', this.coverFile);
    }
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
    formData.append('deleteLogo', this.deleteLogo);
    formData.append('deleteCover', this.deleteCover);
    this.publicationService.editPublication(formData, this.publication.slug).subscribe(
      (result: Publication) => {
        console.log(result);
        this.editMode = false;
        this.textChanging = false;
        this.publication = result;
      }
    );
  }

  onTextChange($event) {
    this.textChanging = true;
  }

  dropdownSelect($event) {
    console.log($event);
    if ($event == 'delete') {
      this.deleteCover = '1';
      this.coverFile = null;
      this.edit();
    }
  }

  removeLogo() {
    this.deleteLogo = '1';
    this.logoFile = null;
    this.logoData = {};
  }

  ngOnDestroy() {

  }
}
