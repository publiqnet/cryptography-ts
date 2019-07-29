import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
  Output,
  EventEmitter
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { isPlatformBrowser } from '@angular/common';
import { ENTER } from '@angular/cdk/keycodes';

import { map, debounceTime, filter, takeUntil, flatMap, switchMap } from 'rxjs/operators';
import { forkJoin, of, ReplaySubject, zip } from 'rxjs';
import { now } from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { SwiperComponent } from 'ngx-useful-swiper';

import { environment } from '../../../environments/environment';
import { ContentService } from '../../core/services/content.service';
import { NotificationService } from '../../core/services/notification.service';
import { AccountService } from '../../core/services/account.service';
import { ArticleService } from '../../core/services/article.service';
import { Draft, DraftData, IDraft } from '../../core/services/models/draft';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { DialogService } from '../../core/services/dialog.service';
import { FroalaEditorCustomConfigs } from './froala-editor-custom-configs';
import { Content } from '../../core/services/models/content';
import { PublicationService } from '../../core/services/publication.service';
import { Publication } from '../../core/services/models/publication';
import { ChannelService } from '../../core/services/channel.service';
import { NuxService } from '../../core/services/nux.service';
import { ValidationService } from '../../core/validator/validator.service';
import { Boost } from '../../core/services/models/boost';
import { DraftService } from '../../core/services/draft.service';
import { SwiperOptions } from 'swiper';

declare const $: any;

@Component({
  selector: 'app-newcontent',
  templateUrl: './newcontent.component.html',
  styleUrls: ['./newcontent.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewcontentComponent implements OnInit, OnDestroy {
  public contentForm: FormGroup;
  public errorMessages = undefined;
  public formSubmitted = false;
  public formsSubmitAccpted = false;
  public conditionsWarning = '';
  public saveDraftCheck = false;
  public account;
  private hasDraft = false;
  public hasEditableContent = false;
  public isSubmited = false;
  private isArticleBoosted;
  private unsubscribe$ = new ReplaySubject<void>(1);
  public coverSwiperConfig: SwiperOptions;

  @Output() hasPendingChanges: EventEmitter<boolean> = new EventEmitter();
  @Input() draft?: Draft;
  @Input() draftId: number;
  @Input() editableContent?: Content;
  @Input() editableContentId?: string;

  // new variables
  showBoost = false;
  boostField = false;
  public boostDropdownData = [
    {
      'value': 'Test value',
      'text': 'Test text',
      'user': {
        'image': 'http://via.placeholder.com/120x120',
        'first_name': 'Test',
        'last_name': 'News',
        'fullName': 'Test News'
      }
    }
  ];
  public boostPostData = {
    'slug': '5ceb9fc82765246c6cc55b47',
    'author': {
      'slug': '1.0.2',
      'first_name': 'Gohar',
      'last_name': 'Avetisyan',
      'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK',
      'fullName': 'Gohar Avetisyan'
    },
    'created': '11 dec 2019',
    'published': '12 dec 2019',
    'title': 'In the flesh: translating 2d scans into 3d prints',
    'tags': [
      '2017',
      'DEVELOPER',
      'FULLSTACK'
    ],
    'view_count': '1K'
  };
  public boostPostDataImage = {
    'slug': '5ceb9fc82765246c6cc55b47',
    'author': {
      'slug': '1.0.2',
      'first_name': 'Gohar',
      'last_name': 'Avetisyan',
      'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
    },
    'created': '11 dec 2019',
    'published': '12 dec 2019',
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
  };
  public boostTab = [
    {
      'value': '1',
      'text': 'Day'
    },
    {
      'value': '2',
      'text': 'Days',
    },
    {
      'value': '3',
      'text': 'Days',
    }
  ];

  visible = true;
  title: String = '';
  headline: String = '';
  tags = [];
  public sourceOfMaterial = '';
  public reference = '';
  public forAdults = false;
  publications: Publication[] = [];
  content: any;
  publication_slug: string;
  mainCoverImageUrl = '';
  mainCoverImageUri = '';
  listImageUrl = '';
  currentTags = [];
  contentUrl = environment.backend + '/api/file/upload';
  contentId: number;
  actions = {
    main: 1,
    list: 2,
    sample: 3,
    cover_cropped: 4
  };
  coverImages = [];
  listImages = [];
  loadingOnSave = false;
  mainCoverImageChecker = true;
  listImageChecker = true;
  isContentUpLoading = false;
  now = now();
  public titleMaxLenght = 120;
  public maxTagsLength = 32;
  private editorContentObject;
  private editorObject;
  private editorInitObject;
  private editableStoryId: string;
  @ViewChild('coverGallery', {static: false}) coverGallery: SwiperComponent;
  @ViewChild('listGallery', {static: false}) listGallery: SwiperComponent;
  @ViewChild('mainCoverImage', {static: false}) mainCoverImage: ElementRef;
  @ViewChild('listImage', {static: false}) listImage: ElementRef;
  @ViewChild('title', {static: false}) titleElement: ElementRef;
  @ViewChild('tag_list', {static: false}) tagsElement: ElementRef;
  @ViewChild('content', {static: false}) contentElement: ElementRef;
  showErrors = false;

  contentUris = {};

  isBrowser;
  updateButtonDisable = true;

  contentOptions: any = {
    key: environment.froala_editor_key,
    toolbarInline: true,
    toolbarButtons: ['bold', 'italic', 'paragraphFormat', 'insertLink', 'formatOL', 'formatUL', 'quote'],
    language: (this.accountService.accountInfo && this.accountService.accountInfo.language == 'jp') ? 'ja' : 'en_us',
    dragInline: false,
    pastePlain: true,
    imageInsertButtons: ['imageBack', '|', 'imageUpload', 'imageByURL'],
    videoEditButtons: [],
    quickInsertButtons: ['image', 'video'],
    imageUpload: true,
    imageUploadMethod: 'POST',
    paragraphFormat: {
      N: 'Normal',
      H2: 'H2',
      H3: 'H3',
      H4: 'H4'
    },
    listAdvancedTypes: false,
    linkText: false,
    linkInsertButtons: ['linkBack'],
    imageUploadURL: this.contentUrl,
    videoAllowedTypes: ['mp4', 'webm', 'ogg'],
    imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif'],
    charCounterMax: 65535,
    charCounterCount: false,
    lineBreakerTags: ['table', 'hr', 'form'],
    linkAlwaysBlank: true,
    imageMaxSize: 5 * 1024 * 1024, // 5MB
    pasteDeniedAttrs: ['class', 'id', 'style', 'srcset'],
    imageResize: false,
    imageEditButtons: ['imageCaption'],
    imagePasteProcess: true,
    imageDefaultWidth: null,
    // imageUploadParams: {
    //   action: 3,
    //   content_id: this.contentId
    // },
    requestHeaders: {
      'X-API-TOKEN': (this.accountService.accountInfo && this.accountService.accountInfo.token)
        ? this.accountService.accountInfo.token
        : '',
      'X-API-CHANNEL': this.channelService.channel ? this.channelService.channel : 'stage'
    },
    events: {
      'froalaEditor.initialized': (e, editor) => {
        this.editorObject = e;
        this.editorContentObject = editor;
      },
      'froalaEditor.html.set': function (e, editor) {
        editor.events.trigger('charCounter.update');
      },
      'froalaEditor.contentChanged': (e, editor) => {
        this.currentEditorLenght = this.calculateContentLength(editor.html.get());
      },
      // 'froalaEditor.image.beforeUpload': (e, editor, images) => {
      //   editor.opts.imageUploadParams = {
      //     action: 3,
      //     content_id: this.contentId
      //   };
      // },
      'froalaEditor.image.inserted': (e, editor, img, response) => {
        if (response) {
          const responseData = JSON.parse(response);
          this.contentUris[responseData.uri] = responseData.link;
          const uploadedImageOriginal = responseData.content_original_sample_file;
          const uploadedImageThumb = responseData.content_thumb_sample_file;

          if (!this.contentId && responseData.content_id) {
            this.contentId = responseData.content_id;
          }

          if (uploadedImageOriginal && uploadedImageThumb) {
            this.resetCurrentUrl(uploadedImageOriginal, uploadedImageThumb);
          }

          if (img && img.get(0).height) {
            $(img).attr('height', img.get(0).height);
          }

          if (img && img.get(0).width) {
            $(img).attr('width', img.get(0).width);
          }

          $(img).closest('p').find('br:first').remove();
          $(img).closest('p').after('<p data-empty="true"><br></p>');
        }
      },
      'froalaEditor.image.error': (e, editor, error, response) => {
        this.dialogService.openInfoDialog(
          'message',
          this.errorService.getError('image_upload_error_explanation'),
          this.articleService.dialogConfig
        );
      },
      'froalaEditor.video.inserted': function (e, editor, $video) {
        $video.closest('p').find('br:last').remove();
        $video.closest('p').after('<p data-empty="true"><br></p>');
      }
    }
  };

  swiperHeight = null;

  private createContentFee = 50000;
  public currentTitleLenght = 0;
  public currentHeadlineLenght = 0;
  public currentEditorLenght = 0;

  constructor(
    private contentService: ContentService,
    private router: Router,
    public route: ActivatedRoute,
    private FormBuilder: FormBuilder,
    private notificationService: NotificationService,
    private accountService: AccountService,
    private articleService: ArticleService,
    private draftService: DraftService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private errorService: ErrorService,
    public dialogService: DialogService,
    private nuxService: NuxService,
    private publicationService: PublicationService,
    private channelService: ChannelService,
    public translateService: TranslateService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {

      FroalaEditorCustomConfigs();

      this.buildForm();

    }
  }

  // new
  onSubmitButton(flag: boolean) {
    this.showBoost = flag;
  }

  onBoostToggle() {
    this.boostField = !this.boostField;
  }
  // new-end

  initFroala($event) {
    if (isPlatformBrowser(this.platformId)) {
      this.editorInitObject = $event;
      this.editorInitObject.initialize();
      setTimeout(() => {
        this.editorContentObject.$placeholder[0].textContent = this.translateService.instant('content.content');
      }, 20);
    }
  }

  characterCounter() {
    this.currentTitleLenght = this.contentForm.value.title ? this.contentForm.value.title.length : 0;
    this.currentHeadlineLenght = this.contentForm.value.headline ? this.contentForm.value.headline.length : 0;
  }

  submit(password: string, boostInfo?) {
    const contentTitle = `<h1>${this.contentForm.value.title}</h1>`;
    let uploadedContentHtml = '';
    const contentBlocks = this.editorContentObject.html.blocks();
    const calls = [];

    contentBlocks.forEach((node) => {
      const nodeHtml = $.trim(node.innerHTML);
      if (nodeHtml != '' && nodeHtml != '<br>' && !nodeHtml.match(/<img/)) {
        calls.push(this.contentService.uploadTextFiles(nodeHtml));
      } else if (nodeHtml.match(/<img/)) {
        let outerText = node.outerHTML;
        const regex = /<img[^>]*src="([^"]*)"/g;
        const src = regex.exec(outerText)[1];
        const imgUri = Object.keys(this.contentUris).find(key => this.contentUris[key] === src);
        if (imgUri && this.contentUris[imgUri]) {
          outerText = outerText.replace(this.contentUris[imgUri], imgUri);
        }
        calls.push(of(outerText));
      } else {
        calls.push(of(node.outerHTML));
      }
    });

    forkJoin(calls).subscribe((data: any) => {
      if (data.length) {
        data.forEach((nextResult) => {
          if (nextResult['uri']) {
            uploadedContentHtml += `<p>${nextResult['uri']}</p>`;
            this.contentUris[nextResult['uri']] = nextResult['link'];
          } else {
            uploadedContentHtml += nextResult;
          }
        });
      }

      let contentData = `${contentTitle} ${uploadedContentHtml}`;
      if (this.mainCoverImageUri && this.mainCoverImageUrl) {
        this.contentUris[this.mainCoverImageUri] = this.mainCoverImageUrl;
        const contentCover = `<img src="${this.mainCoverImageUri}" data-uri="${this.mainCoverImageUri}">`;
        contentData = `${contentCover} ${contentTitle} ${uploadedContentHtml}`;
      }

      console.log(this.contentUris, this.mainCoverImageUri, this.mainCoverImageUrl);

      this.isContentUpLoading = true;
      this.isSubmited = true;
      this.formSubmitted = true;
      this.loadingOnSave = true;

      this.contentForm.value.content = this.contentForm.value.content.replace(/contenteditable="[^"]*"/g, '');

      if (Object.keys(this.contentUris).length) {
        this.contentService.signFiles(Object.keys(this.contentUris), password)
          .pipe(
            switchMap((data: any) => {
              return this.submitContent(contentData, password);
            })
          ).subscribe(data => {
          this.afterContentSubmit();
        });
      } else {
        this.submitContent(contentData, password)
          .subscribe(data => {
            console.log('NO signFiles - ', data);
            this.afterContentSubmit();
          });
      }
    });
  }

  afterContentSubmit() {
    this.formsSubmitAccpted = true;
    this.accountService.getAccountData();
    if (this.loadingOnSave) {
      this.loadingOnSave = false;
    }
    if (this.draftId) {
      this.draftService.delete(this.draftId).subscribe();
    }
    // if (this.boostInfo && this.boostInfo.boostEnabled) {
    //   this.contentService.articleBoost(this.password, )
    // }
    this.hasPendingChanges.next(false);
    this.router.navigate(['/content/mycontent']);
  }

  private submitContent(contentData, password) {
    let uploadedContentURI = '';
    return this.contentService.unitUpload(contentData)
      .pipe(
        switchMap((data: any) => {
          uploadedContentURI = data.uri;
          return this.contentService.unitSign(data.channelAddress, this.contentId, data.uri, Object.keys(this.contentUris), password);
        }),
        switchMap((data: any) => this.contentService.publish(uploadedContentURI, this.contentId))
      );
  }

  private buildForm(): void {
    this.contentForm = this.FormBuilder.group({
      // headline: new FormControl(this.headline, [
      //   Validators.maxLength(this.headlineMaxLenght)
      // ]),
      title: new FormControl(this.title, [
        Validators.required,
        Validators.maxLength(this.titleMaxLenght),
        ValidationService.noWhitespaceValidator
      ]),
      // tags: new FormControl(this.tags, [Validators.required]),
      content: new FormControl(this.content, [
        Validators.required,
        (control: AbstractControl): { [key: string]: any } | null => {
          return this.currentEditorLenght ? null : {'required': true};
        },
        (control: AbstractControl): { [key: string]: any } | null => {
          return this.currentEditorLenght > this.contentOptions.charCounterMax
            ? {'contentLength': {value: this.currentEditorLenght}}
            : null;
        }
      ]),
      // sourceOfMaterial: new FormControl(this.sourceOfMaterial, []),
      // reference: new FormControl(this.reference, []),
      // forAdults: new FormControl(this.forAdults, []),
      publicationSlug: new FormControl(this.publication_slug || 'none')
    });
  }

  saveDraft(id = null) {
    // do not autosave the content
    // if this is a content update instead of draft edit
    if (this.hasEditableContent) {
      return;
    }

    const message = this.translateService.instant('content.draft_saving');
    this.notificationService.autoSave(message);
    if (this.tags && this.tags.length) {
      this.contentForm.value.tags = this.tags;
    }
    if (typeof this.contentForm.value.tags === 'string' || this.contentForm.value.tags instanceof String) {
      this.contentForm.value.tags = [this.contentForm.value.tags];
    }
    const newDraft: any = {
      // tags: this.contentForm.value.tags || [],
      // coverImages: this.coverImages || [],
      // mainCoverImageUrl: this.mainCoverImageUrl || '',
      // mainCoverImageChecker: this.mainCoverImageChecker,
      // listImages: this.listImages || [],
      // mainListImageUrl: this.listImageUrl || '',
      // listImageChecker: this.listImageChecker,
      // content: this.contentForm.value.content || '',
      // lastModifiedDate: Date.now(),
      publication: this.contentForm.value.publicationSlug,
      // contentId: this.contentId
      content: this.contentForm.value.content || '',
      // forAdults: this.contentForm.value.forAdults,
      // headline: this.contentForm.value.headline || '',
      // reference: this.contentForm.value.reference || '',
      // sourceOfMaterial: this.contentForm.value.sourceOfMaterial || '',
      title: this.contentForm.value.title || '',
      contentUris: this.contentUris || {}
    };

    if (id) {
      this.draftService.update(id, newDraft);
    } else {
      this.draftService.create(newDraft);
    }
  }

  checkImageHashExist() {
    const image = this.account.image ? this.account.image : '';
    return !!(this.account && image && image !== '' && !image.startsWith('http://127.0.0.1'));
  }

  resetCurrentUrl(original, thumbnail = '') {
    // if (isPlatformBrowser(this.platformId)) {
    //   const d = new Image();
    //   d.src = thumbnail;
    //   d.onload = () => {
    //     this.swiperHeight = d.naturalHeight;
    //   };
    // }

    this.coverImages.push(original);
    // this.listImages.push(thumbnail);

    // cover image
    this.mainCoverImageChecker = true;
    this.mainCoverImageUrl = original;
    const coverIndex = this.coverImages.length - 1;

    this.coverGallery.swiper.update(true);
    setTimeout(() => {
      this.coverGallery.swiper.slideTo(coverIndex, 0, false);
    }, 1000);

    // // list image
    // this.listImageChecker = true;
    // this.listImageUrl = thumbnail;
    // const listIndex = this.listImages.length - 1;
    //
    // if (this.listGallery) {
    //   this.listGallery.swiper.update(true);
    // }
    //
    // setTimeout(() => {
    //   this.listGallery.swiper.slideTo(listIndex, 0, false);
    // }, 1000);

    // this.updateButtonDisable = false;
    this.saveDraft(this.draftId);
  }


  calculateContentLength(contentHtml) {
    return (contentHtml) ? contentHtml.replace(/<(?:.|\n)*?>/gm, '').replace(/(\r\n|\n|\r)/gm, '').replace('&nbsp;', '').length : 0;
  }

  ngOnDestroy() {
    if (this.contentId > 0 && !this.formsSubmitAccpted && !this.hasDraft) {
      this.contentService.destroyContent(this.contentId);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
      this.contentService.hideFooter$.emit(false);
    }
  }
}
