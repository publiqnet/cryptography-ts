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
import { Draft } from '../../core/services/models/draft';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { DialogService } from '../../core/services/dialog.service';
import { FroalaEditorCustomConfigs } from './froala-editor-custom-configs';
import { Content } from '../../core/services/models/content';
import { PublicationService } from '../../core/services/publication.service';
import { Publication } from '../../core/services/models/publication';
import { ChannelService } from '../../core/services/channel.service';
import { NuxService } from '../../core/services/nux.service';
import { NewstorySubmissionComponent } from '../../core/newstory-submission/newstory-submission.component';
import { ValidationService } from '../../core/validator/validator.service';
import { Boost } from '../../core/services/models/boost';
import { DraftService } from '../../core/services/draft.service';
import { Publications } from '../../core/services/models/publications';
import { SwiperOptions } from 'swiper';

declare const $: any;
const scrollElementIntoView = (element: HTMLElement) => {

  const scrollTop = window.pageYOffset || element.scrollTop;

  const finalOffset = Math.max(0, element.getBoundingClientRect().top + scrollTop - 300);

  $('html, body').animate({
    scrollTop: finalOffset
  });
};
const COMMA = 188;
const IMAGE_GIF = 'gif';

@Component({
  selector: 'app-newcontent-old',
  templateUrl: './newcontent-old.component.html',
  styleUrls: ['./newcontent-old.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewcontentOldComponent implements OnInit, OnDestroy {
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
  public nuxSeen = true;
  private boostInfo;
  private isArticleBoosted;
  private unsubscribe$ = new ReplaySubject<void>(1);
  public coverSwiperConfig: SwiperOptions;

  @Output() hasPendingChanges: EventEmitter<boolean> = new EventEmitter();
  @Input() draft?: Draft;
  @Input() draftId: number;
  @Input() editableContent?: Content;
  @Input() editableContentId?: string;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  openInputSpace = false;

  // Enter, comma
  separatorKeysCodes = [ENTER];
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
  public headlineMaxLenght = 255;
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

  listSwiperConfig: any = {
    prevButton: '.list-photo-prev',
    nextButton: '.list-photo-next',
    slideToClickedSlide: true,
    slidesPerView: '1',
    observer: true,
    observeParents: true,
    breakpoints: {
      // when window width is <= 480px
      480: {
        slidesPerView: 1,
      },
      // when window width is <= 640px
      640: {
        slidesPerView: 1,
      },
      // when window width is <= 640px
      1024: {
        slidesPerView: 1,
      }
    },
    onInit: (e) => {
      if (this.listImages.length && this.listImageUrl) {
        e.slideTo(this.listImages.indexOf(this.listImageUrl));
      }
    },
    onSlideChangeEnd: (e) => {
      const currentListImage = this.listImageUrl;
      if (e.clickedSlide && e.clickedSlide.attributes['data-image']) {
        this.listImageUrl = e.clickedSlide.attributes['data-image'].value;
      } else if (this.listImages && this.listImages[e.activeIndex]) {
        this.listImageUrl = this.listImages[e.activeIndex];
      }

      this.swiperHeight = e.slides[e.activeIndex].querySelector('img').offsetHeight;
      if (currentListImage != this.listImageUrl) {
        this.saveDraft(this.draftId);
      }
    },
    onSlideChangeStart: (e) => {
      if (this.listImages && this.listImages[e.activeIndex]) {
        this.listImageUrl = this.listImages[e.activeIndex];
      }

      this.saveDraft(this.draftId);
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
      this.coverSwiperConfig = {
        // prevButton: '.cover-photo-prev',
        // nextButton: '.cover-photo-next',
        slideToClickedSlide: true,
        // slidesPerView: '1',
        observer: true,
        observeParents: true,
        breakpoints: {
          // when window width is <= 480px
          480: {
            slidesPerView: 1,
          },
          // when window width is <= 640px
          640: {
            slidesPerView: 1,
          },
          // when window width is <= 640px
          1024: {
            slidesPerView: 1,
          }
        },
        // onInit: (e) => {
        //   if (this.coverImages.length && this.mainCoverImageUrl) {
        //     e.slideTo(this.coverImages.indexOf(this.mainCoverImageUrl));
        //   }
        // },
        // onSlideChangeEnd: (e) => {
        //   const currentMainImage = this.mainCoverImageUrl;
        //   if (e.clickedSlide && e.clickedSlide.attributes['data-image']) {
        //     this.mainCoverImageUrl = e.clickedSlide.attributes['data-image'].value;
        //   } else if (this.coverImages && this.coverImages[e.activeIndex]) {
        //     this.mainCoverImageUrl = this.coverImages[e.activeIndex];
        //   }
        //
        //   if (currentMainImage != this.mainCoverImageUrl) {
        //     this.saveDraft(this.draftId);
        //   }
        // },
        // onSlideChangeStart: (e) => {
        //   if (this.coverImages && this.coverImages[e.activeIndex]) {
        //     this.mainCoverImageUrl = this.coverImages[e.activeIndex];
        //   }
        //
        //   this.saveDraft(this.draftId);
        // }
      };
      this.coverSwiperConfig = {
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: {
          nextEl: '.cover-photo-next',
          prevEl: '.cover-photo-prev'
        },
        spaceBetween: 30
      };

      this.isContentUpLoading = false;
      this.isSubmited = false;
      this.contentService.hideFooter$.emit(true);

      FroalaEditorCustomConfigs();

      if (this.draft) {
        this.hasDraft = true;
        // ===> insert draft content into editor here <===
        if (Array.isArray(this.draft.tags)) {
          this.tags = this.draft.tags;
        }
        // this.content = this.draft.content;
        // this.currentEditorLenght = this.calculateContentLength(this.content);
        // this.headline = this.draft.headline;
        // this.title = this.draft.title;
        // // console.log('fromDraft');
        // this.coverImages = this.draft.coverImages || [];
        // this.mainCoverImageUrl = this.draft.mainCoverImageUrl || '';
        // this.listImageUrl = this.draft.mainListImageUrl || '';
        // this.listImages = this.draft.listImages || [];
        // this.mainCoverImageChecker = this.draft.mainCoverImageChecker;
        // this.listImageChecker = this.draft.listImageChecker;
        // this.sourceOfMaterial = this.draft.sourceOfMaterial || '';
        // this.reference = this.draft.reference || '';
        // this.forAdults = this.draft.forAdults;
        // this.contentId = this.draft.contentId;
        // this.publication_slug = this.draft.publication ? this.draft.publication : '';
        // this.contentUris = this.draft.contentUris;
        // this.contentId = this.draft.id;
        // // slides the swiper to the chosen thumbnail
        // if (this.coverImages && this.coverImages.length > 1) {
        //   // this.coverSwiperConfig.onInit = swiper => {
        //   //   swiper.slideTo(this.coverImages.indexOf(this.mainCoverImageUrl));
        //   // };
        // }
        // if (this.listImages && this.listImages.length > 1) {
        //   // this.listSwiperConfig.onInit = swiper => {
        //   //   swiper.slideTo(this.listImages.indexOf(this.listImageUrl));
        //   // };
        // }
      }

      // if (this.editableContent) {
      //   this.hasEditableContent = true;
      //   if (Array.isArray(this.editableContent.meta.tags)) {
      //     const tags = [];
      //     this.editableContent.meta.tags.forEach(tag => {
      //       tags.push(tag.value);
      //     });
      //     this.tags = tags;
      //   }
      //
      //   this.content = this.editableContent.content && this.editableContent.content.data && this.editableContent.content.data.text ? this.editableContent.content.data.text : '';
      //   this.currentEditorLenght = this.calculateContentLength(this.content);
      //   this.headline = this.editableContent.meta.headline;
      //   this.title = this.editableContent.meta.title;
      //   this.coverImages = this.editableContent.meta.image_hash ? (this.coverImages = [this.editableContent.meta.image_hash]) : [];
      //   this.mainCoverImageUrl = this.editableContent.meta.image_hash || '';
      //   this.listImageUrl = this.editableContent.meta.thumbnail_hash || '';
      //   this.listImages = this.editableContent.meta.thumbnail_hash ? (this.listImages = [this.editableContent.meta.thumbnail_hash]) : [];
      //   this.mainCoverImageChecker = true;
      //   this.listImageChecker = true;
      //   this.sourceOfMaterial = (this.editableContent.meta.sourceOfMaterial || this.editableContent.meta.source_of_material) || '';
      //   this.reference = this.editableContent.meta.reference || '';
      //   this.forAdults = this.editableContent.meta.for_adults && this.editableContent.meta.for_adults == 'true' ? true : false;
      //   this.now = this.editableContent.created;
      //
      //   this.publication_slug = this.editableContent.publication ? this.editableContent.publication.slug : '';
      //   // slides the swiper to the chosen thumbnail
      //   if (isPlatformBrowser(this.platformId)) {
      //     if (this.coverImages.length > 1) {
      //       // this.coverSwiperConfig.onInit = swiper => {
      //       //   swiper.slideTo(this.coverImages.indexOf(this.mainCoverImageUrl));
      //       // };
      //     }
      //     if (this.listImages.length > 1) {
      //       this.listSwiperConfig.onInit = swiper => {
      //         swiper.slideTo(this.listImages.indexOf(this.listImageUrl));
      //       };
      //     }
      //   }
      //
      //   if (this.editableContent['_id']) {
      //     this.editableStoryId = this.editableContent['_id'];
      //     this.articleService.getListPromoByDsId(this.editableStoryId);
      //   }
      // }

      this.articleService.listPromoByDsIdChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: Boost[]) => {
          this.isArticleBoosted = (data && data[0] != undefined);
        });

      this.buildForm();

      this.route.queryParams
        .pipe(
          filter(params => params != null),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(params => {
          if (params.publicationSlug) {
            this.contentForm.controls.publicationSlug.setValue(params.publicationSlug);
            this.publication_slug = params.publicationSlug;
          }
        });

      this.contentForm.valueChanges
        .pipe(
          debounceTime(3000),
          map(() => {
            this.hasPendingChanges.emit(true);
            if (!this.isSubmited) {
              this.saveDraft(this.draftId);
            }
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
            this.updateButtonDisable = false;
            this.errorMessages = '';

            this.saveDraftCheck = !!(
              this.contentForm.value.title ||
              this.contentForm.value.headline ||
              // this.contentForm.value.tags.length ||
              this.mainCoverImageUrl ||
              this.listImageUrl ||
              this.contentForm.value.content
            );

            this.errorMessages = '';
            this.conditionsWarning = '';
          },
          err => console.log(err)
        );

      this.account = this.accountService.getAccount();

      // this.publicationService.getMyPublications()
      // .pipe(
      //   map((publications: Publications) => {
      //     return publications.owned.concat(publications.membership);
      //   }),
      //   takeUntil(this.unsubscribe$)
      // )
      // .subscribe((publications: Publication[]) => {
      //   this.publications = publications;
      // });

      this.loadingOnSave = false;
      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: ErrorEvent) => {
          if (['addDraft', 'editDraft'].includes(data.action)) {
            this.loadingOnSave = false;
            this.notificationService.error(data.message);
          } else if (['deleteDraft'].includes(data.action)) {
            this.notificationService.error(data.message);
          } else if (['uploadMainPhoto', 'uploadListPhoto'].includes(data.action)) {
            this.notificationService.error(this.errorService.getError('image_upload_error'));
          } else if (data.action === 'submit') {
            this.formSubmitted = false;
            this.notificationService.error(
              data.message
            );
            if (this.loadingOnSave) {
              this.loadingOnSave = false;
            }

            this.isSubmited = false;
          }
        });

      // this.draftService.draftData$
      //   .pipe(
      //     takeUntil(this.unsubscribe$)
      //   )
      //   .subscribe((draft) => {
      //       if (draft) {
      //         this.hasDraft = true;
      //         const message = this.translateService.instant('content.draft_saved');
      //         this.notificationService.autoSave(message);
      //         this.draftId = draft.id;
      //         if (!this.contentId) {
      //           this.contentId = this.draftId;
      //         }
      //       }
      //     }
      //   );

      this.contentService.uploadMainPhotoDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(result => {
            this.saveDraftCheck = true;

            if (!this.contentId && result.content_id) {
              this.contentId = result.content_id;
            }
            if (
              result.content_original_main_file &&
              result.content_thumb_main_file
            ) {
              this.resetCurrentUrl(
                result.content_original_main_file,
                result.content_thumb_main_file
              );
            }
          }
        );

      this.contentService.uploadListPhotoDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(result => {
          this.saveDraftCheck = true;

          if (!this.contentId && result.content_id) {
            this.contentId = result.content_id;
          }
          if (
            result.content_original_list_file &&
            result.content_thumb_list_file
          ) {
            this.resetCurrentUrl(
              result.content_original_list_file,
              result.content_thumb_list_file
            );
          }
        });

      this.contentService.articleUpLoadingChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          data => {
            this.isContentUpLoading = data;
          }
        );

      this.accountService.accountUpdated$
        .pipe(
          filter(result => result != null),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(result => {
          // this.nuxSeen = result.nuxEditor;
          // // this.nuxSeen = false;
          // // console.log('nux', this.nuxSeen, result);
          // const currentOptionLang = this.contentOptions.language == 'en_us' ? 'en' : 'jp';
          // if (result.language != currentOptionLang && this.editorObject) {
          //   this.contentOptions.language = (result.language == 'en') ? 'en_us' : 'ja';
          //
          //   const currentContent = this.editorContentObject.html.get();
          //   this.editorInitObject.destroy();
          //   this.editorInitObject.initialize();
          //   if (currentContent) {
          //     this.editorContentObject.html.set(currentContent);
          //   }
          // }
          //
          // this.translateService.get('content')
          //   .pipe(
          //     takeUntil(this.unsubscribe$)
          //   )
          //   .subscribe(data => {
          //     if (this.editorContentObject && data.content) {
          //       this.editorContentObject.$placeholder[0].textContent = data.content;
          //     }
          //   });
        });
    }
  }

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

  goToPublicationPage(slug) {
    this.router.navigate(['/p/' + slug]);
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

    /////////////////////////////////////////////////////////////////////////////

    // this.submitContent(this.contentForm.value, contentData, password);

    // if (boostInfo) {
    //   this.boostInfo = boostInfo;
    // }
    //
    // // this.isContentUpLoading = true;
    // this.isSubmited = true;
    // if (this.tags && this.tags.length) {
    //   this.contentForm.value.tags = this.tags;
    // }
    //
    // if (this.editorContentObject) {
    //   this.contentForm.patchValue({content: this.editorContentObject.html.get()});
    //   this.contentForm.value.tags = (this.tags && this.tags.length) ? this.tags : [];
    // }
    //
    // let nextImageData = '';
    // let currentSrc = '';
    // const contentData = this.contentForm.value.content;
    //
    // const imagesData = contentData.match(
    //   /<img([^>]+)src="[/]?([^"]+)"([^>]*)>|<( *)img( *)[/>|>]/g
    // );
    //
    // if (imagesData && imagesData.length) {
    //   let imagesError = 0;
    //   imagesData.map(image => {
    //     if (image) {
    //       nextImageData = image.match(/src\=([^\s]*)\s/)[1];
    //       currentSrc = nextImageData.substring(1, nextImageData.length - 1);
    //       if (currentSrc.indexOf(environment.filestorage_link) === -1) {
    //         imagesError++;
    //       }
    //     }
    //   });
    //
    //   if (!imagesError) {
    //     this.submitContent(
    //       this.contentForm.value,
    //       this.mainCoverImageUrl,
    //       this.listImageUrl,
    //       this.contentId,
    //       password
    //     );
    //   } else {
    //     this.dialogService.openInfoDialog(
    //       'message',
    //       this.errorService.getError('image_upload_error_explanation'),
    //       this.articleService.dialogConfig
    //     );
    //     return false;
    //   }
    // } else {
    //   this.submitContent(
    //     this.contentForm.value,
    //     this.mainCoverImageUrl,
    //     this.listImageUrl,
    //     this.contentId,
    //     password
    //   );
    // }
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
        switchMap((data: any) => this.contentService.publish(uploadedContentURI, this.contentId, 'test_publication', 'test_tag'))
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

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    let result = [];

    if (value.indexOf(',') > -1) {
      result = value.split(',');
      result = result.filter(function (e) {
        return e != '';
      });
      if (result && result.length > 3) {
        result = result.slice(0, 3);
      }
    }

    // Add our person
    if (result && result.length > 1) {
      result.forEach(value => {
        this.pushTag(value);
      });
    } else {
      this.pushTag(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  pushTag(value) {
    if ((value || '').trim() && this.tags && this.tags.length < 3 && (value.trim().length <= this.maxTagsLength)) {
      if (!this.currentTags.includes(value.trim())) {
        this.tags.push(value.trim());
        this.currentTags.push(value.trim());
      }
    }
  }

  remove(itemTag: any): void {
    const index = this.tags.indexOf(itemTag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.currentTags.splice(index, 1);
    }

    if (!this.tags.length) {
      this.contentForm.controls['tags'].setErrors({'incorrect': true});
    }

    this.contentForm.updateValueAndValidity({onlySelf: true, emitEvent: true});
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

  clickUploadCover() {
    if (this.mainCoverImageChecker) {
      this.mainCoverImage.nativeElement.click();
    }
  }

  onCoverCkeckerChange(e) {
    this.saveDraftCheck = true;
    if (e.checked == true) {
      this.mainCoverImageChecker = true;
      this.mainCoverImageUrl = this.coverImages[this.coverGallery.swiper.activeIndex];
    } else {
      this.mainCoverImageChecker = false;
      this.mainCoverImageUrl = '';
    }
    this.saveDraft(this.draftId);
    this.updateButtonDisable = false;
  }

  mainImageUpload(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      this.contentService.uploadMainPhoto(input.files[0]).subscribe(data => {
        this.resetCurrentUrl(data.link);
        this.mainCoverImageUri = data.uri;
        this.mainCoverImageUrl = data.link;
      });
    }
  }

  listImageUpload(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      this.contentService.uploadListPhoto(input.files[0], this.contentId, this.actions.list);
    }
  }

  clickUploadListImage() {
    if (this.listImageChecker) {
      this.listImage.nativeElement.click();
    }
  }

  listImageCheckerChange(e) {
    this.saveDraftCheck = true;
    if (e.checked == true) {
      this.listImageChecker = true;
      this.listImageUrl = this.listImages[this.listGallery.swiper.activeIndex];
    } else {
      this.listImageChecker = false;
      this.listImageUrl = '';
    }
    this.saveDraft(this.draftId);
    this.updateButtonDisable = false;
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

  openDialogSubmission() {
    this.showErrors = false;
    if (!this.contentForm.valid) {
      this.showErrors = true;
      this.notificationService.error(this.translateService.instant('content.required'));
      Object.keys(this.contentForm.controls).some((controlname) => {
        if (this.contentForm.controls[controlname].invalid) {
          scrollElementIntoView(this[controlname + 'Element'].nativeElement);
          return true;
        }
        return false;
      });
      return;
    }
    const dialogMessages = this.translateService.instant('dialog');
    const message = this.hasEditableContent ? dialogMessages['confirm']['update_story_title'] : dialogMessages['confirm']['new_story_title'];
    if (!this.accountService.accountInfo.firstName) {
      this.dialogService.openInfoDialog('settings', dialogMessages['info']['settings_title'], {
        width: '700px',
        height: '450px',
        panelClass: 'story-page'
      });
    } else {
      if (this.isArticleBoosted) {
        this.dialogService.openConfirmDialog(message)
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(done => {
            if (done) {
              if (!this.accountService.accountInfo.balance || this.accountService.accountInfo.balance < this.createContentFee) {
                this.notificationService.error(this.errorService.getError('create_content_balance_error'));
                return false;
              } else {
                const titleText = this.translateService.instant('dialog.password.title');
                const descriptionText = this.translateService.instant('dialog.password.description');
                this.dialogService.openInputPasswordDialog('show-private-key', titleText, descriptionText, {
                  maxWidth: '600px',
                  panelClass: 'modal-padding'
                })
                  .pipe(
                    takeUntil(this.unsubscribe$)
                  )
                  .subscribe(data => {
                    if (data && data.password) {
                      return this.submit(data.password);
                    }
                  });
              }
            }
          });
      } else {
        const dialogRef = this.dialog.open(NewstorySubmissionComponent, {
          width: '460px',
          panelClass: 'newstory-submission',
          data: {message, editableContent: this.hasEditableContent}
        }).afterClosed()
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(done => {
            if (done) {
              if (false) {
                this.notificationService.error(this.errorService.getError('boost_content_balance_error'));
                return false;
              } else {
                const titleText = this.translateService.instant('dialog.password.title');
                const descriptionText = this.translateService.instant('dialog.password.description');
                this.dialogService.openInputPasswordDialog('show-private-key', titleText, descriptionText, {
                  maxWidth: '600px',
                  panelClass: 'modal-padding'
                })
                  .pipe(
                    takeUntil(this.unsubscribe$)
                  )
                  .subscribe(data => {
                    if (data && data.password) {
                      if (done.boostEnabled) {
                        return this.submit(data.password, done);
                      }
                      return this.submit(data.password);
                    }
                  });
              }
            }
          });
      }
    }
  }

  public openDialog() {
    if (this.contentForm.invalid) {
      return;
    }

    const dialogMessages = this.translateService.instant('dialog');
    if (!this.accountService.accountInfo.firstName) {
      this.dialogService.openInfoDialog('settings', dialogMessages['info']['settings_title'], {
        width: '700px',
        height: '450px',
        panelClass: 'story-page'
      });
    } else {
      const message = this.hasEditableContent ? dialogMessages['confirm']['update_story_title'] : dialogMessages['confirm']['new_story_title'];
      this.dialogService.openConfirmDialog(message)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(done => {
          if (done) {
            if (!this.accountService.accountInfo.balance || this.accountService.accountInfo.balance < this.createContentFee) {
              this.notificationService.error(this.errorService.getError('create_content_balance_error'));
              return false;
            } else {
              const titleText = this.translateService.instant('dialog.password.title');
              const descriptionText = this.translateService.instant('dialog.password.description');
              this.dialogService.openInputPasswordDialog('show-private-key', titleText, descriptionText, {
                maxWidth: '600px',
                panelClass: 'modal-padding'
              })
                .pipe(
                  takeUntil(this.unsubscribe$)
                )
                .subscribe(data => {
                  if (data && data.password) {
                    return this.submit(data.password);
                  }
                });
            }
          }
        });
    }
  }

  onCancel(): void {
    this.hasPendingChanges.next(false);
    this.router.navigate(['/content/mycontent']);
  }

  currentPublicationName() {
    let selectedPublicationName = '';
    this.publications.forEach((nextPublication) => {
      if (nextPublication.slug == this.contentForm.value.publicationSlug) {
        selectedPublicationName = nextPublication.title;
      }
    });

    return selectedPublicationName;
  }

  editCoverPhoto() {
    if (!this.mainCoverImageUrl) {
      return;
    }

    let coverUrlForCropping = this.mainCoverImageUrl;

    if (coverUrlForCropping.includes('?')) {
      coverUrlForCropping = coverUrlForCropping.split('?')[0];
    }

    const coverImageUrl = coverUrlForCropping.replace('cropped', 'original');
    const editData = {
      'imageUrl': coverImageUrl,
      'contentId': this.contentId
    };

    this.dialogService.openCoverEditDialog(editData)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(responseData => {
        if (responseData && responseData[0] && responseData[1]) {
          const obj = responseData[1];
          if (!this.contentId && obj.content_id) {
            this.contentId = obj.content_id;
          }
          if (obj && obj['content_cover_cropped_file']) {
            const ts = Math.round((new Date()).getTime() / 1000);
            for (const i in this.coverImages) {
              if (this.coverImages[i] == this.mainCoverImageUrl) {
                this.coverImages[i] = obj['content_cover_cropped_file'] + '?' + ts;
                break; // Stop this loop, we found it!
              }
            }
            this.mainCoverImageUrl = obj['content_cover_cropped_file'] + '?' + ts;
            this.updateButtonDisable = false;
            this.saveDraft(this.draftId);
          }
        }
      });
  }

  enableNux() {
    // order matters
    this.nuxService.reset('editor');
    this.nuxSeen = false;
  }

  calculateContentLength(contentHtml) {
    return (contentHtml) ? contentHtml.replace(/<(?:.|\n)*?>/gm, '').replace(/(\r\n|\n|\r)/gm, '').replace('&nbsp;', '').length : 0;
  }

  isValidMainCoverImage() {
    if (this.mainCoverImageUrl) {
      const mainImageExtension = this.mainCoverImageUrl.split('.').pop();
      if (mainImageExtension && mainImageExtension != IMAGE_GIF) {
        return true;
      }
    }

    return false;
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
