import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../core/services/account.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of, ReplaySubject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ContentService } from '../../core/services/content.service';
import { Router } from '@angular/router';
import { DraftService } from '../../core/services/draft.service';

declare const $: any;

@Component({
  selector: 'app-newcontent',
  templateUrl: './newcontent.component.html',
  styleUrls: ['./newcontent.component.scss']
})
export class NewContentComponent implements OnInit, OnDestroy {
  showStoryForm: boolean = false;
  boostField: boolean = false;
  public contentId: number;
  private contentObject;
  private editorContentInitObject;
  private editorContentObject;
  private titleObject;
  private editorTitleInitObject;
  private editorTitleObject;
  public titleMaxLenght = 120;
  contentUrl = environment.backend + '/api/file/upload';
  public contentForm: FormGroup;
  contentUris = {};
  title: string;
  content: string;
  publication: string;
  titleOptions: object;
  contentOptions: object;
  public boostDropdownData = [];
  public currentContentData = {};
  public boostTab = [];
  public mainCoverImageUri: string;
  public mainCoverImageUrl: string;
  public submitStep: number = 1;
  public boostView = 'boost';
  public stepperData = [];
  private hasDraft = false;
  public isSubmited = false;
  public boostPrice: number;
  public boostDays: number;
  private uploadedContentUri: string;
  public submitError: boolean = false;
  public titleText: string;

  private unsubscribe$ = new ReplaySubject<void>(1);
  @Input() draftId: number;

  constructor(
    private router: Router,
    public accountService: AccountService,
    private formBuilder: FormBuilder,
    public translateService: TranslateService,
    private contentService: ContentService,
    private draftService: DraftService
  ) {
  }

  ngOnInit() {
    this.initDefaultData();
    this.buildForm();
    this.initSubscribes();
  }

  private buildForm(): void {
    this.contentForm = this.formBuilder.group({
      title: new FormControl(this.title, [
        Validators.required,
        Validators.maxLength(this.titleMaxLenght),
        ValidationService.noWhitespaceValidator
      ]),
      // tags: new FormControl(this.tags, [Validators.required]),
      content: new FormControl(this.content, [
        Validators.required,
        // (control: AbstractControl): { [key: string]: any } | null => {
        //   return this.currentEditorLenght ? null : {'required': true};
        // },
        // (control: AbstractControl): { [key: string]: any } | null => {
        //   return this.currentEditorLenght > this.contentOptions.charCounterMax
        //     ? {'contentLength': {value: this.currentEditorLenght}}
        //     : null;
        // }
      ]),
      password: new FormControl('', [
        ValidationService.passwordValidator
      ]),
      publication: new FormControl(this.publication || 'none')
    });
  }

  initDefaultData() {
    this.boostPrice = 50;
    this.boostDays = 1;
    this.initSubmitFormView();

    this.boostTab = [
      {
        'value': '1',
        'text': '1 Day'
      },
      {
        'value': '3',
        'text': '3 Days',
      },
      {
        'value': '7',
        'text': '7 Days',
      }
    ];

    this.stepperData = [
      {'value': 'Preview', 'slug': 'preview', 'status': false},
      {'value': 'Boost', 'slug': 'boost', 'status': true},
    ];

    this.boostDropdownData = [
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

    this.titleOptions = {
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
      requestHeaders: {
        'X-API-TOKEN': (this.accountService.accountInfo && this.accountService.accountInfo.token)
          ? this.accountService.accountInfo.token
          : ''
      },
      events: {
        'froalaEditor.initialized': (e, editor) => {
          this.titleObject = e;
          this.editorTitleObject = editor;
        },
        'froalaEditor.html.set': function (e, editor) {
          editor.events.trigger('charCounter.update');
        },
        'froalaEditor.contentChanged': (e, editor) => {
          // this.currentEditorLenght = this.calculateContentLength(editor.html.get());
        },
        'froalaEditor.image.inserted': (e, editor, img, response) => {
          if (response) {
            const responseData = JSON.parse(response);
            this.contentUris[responseData.uri] = responseData.link;
            const uploadedImage = responseData.content_original_sample_file;

            if (!this.contentId && responseData.content_id) {
              this.contentId = responseData.content_id;
            }

            if (uploadedImage) {
              // this.resetCurrentUrl(uploadedImage);
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
        },
        'froalaEditor.video.inserted': function (e, editor, $video) {
          $video.closest('p').find('br:last').remove();
          $video.closest('p').after('<p data-empty="true"><br></p>');
        }
      }
    };

    this.contentOptions = {
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
      // fontSizeDefaultSelection: '40',
      // fontSize: '40',
      // fontSizeUnit: 'px',
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
      requestHeaders: {
        'X-API-TOKEN': (this.accountService.accountInfo && this.accountService.accountInfo.token)
          ? this.accountService.accountInfo.token
          : ''
      },
      events: {
        'froalaEditor.initialized': (e, editor) => {
          this.contentObject = e;
          this.editorContentObject = editor;
        },
        'froalaEditor.html.set': function (e, editor) {
          editor.events.trigger('charCounter.update');
        },
        'froalaEditor.contentChanged': (e, editor) => {
          // this.currentEditorLenght = this.calculateContentLength(editor.html.get());
        },
        'froalaEditor.image.inserted': (e, editor, img, response) => {
          if (response) {
            const responseData = JSON.parse(response);
            this.contentUris[responseData.uri] = responseData.link;
            const uploadedImage = responseData.content_original_sample_file;

            if (!this.contentId && responseData.content_id) {
              this.contentId = responseData.content_id;
            }

            if (uploadedImage) {
              // this.resetCurrentUrl(uploadedImage);
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
        },
        'froalaEditor.video.inserted': function (e, editor, $video) {
          $video.closest('p').find('br:last').remove();
          $video.closest('p').after('<p data-empty="true"><br></p>');
        }
      }
    };
  }

  initSubmitFormView() {
    this.submitError = false;

    this.titleText = '';
    this.mainCoverImageUrl = '';
    this.mainCoverImageUri = '';
    if (this.editorTitleObject) {
      const titleBlocks = this.editorTitleObject.html.blocks();
      titleBlocks.forEach((node) => {
        const nodeHtml = $.trim(node.innerHTML);
        if (nodeHtml != '' && nodeHtml != '<br>' && !nodeHtml.match(/<img/)) {
          if (this.titleText == '') {
            this.titleText = nodeHtml;
          }
        } else if (nodeHtml.match(/<img/)) {
          if (this.mainCoverImageUrl == '' || this.mainCoverImageUri == '') {
            const outerText = node.outerHTML;
            const regex = /<img[^>]*src="([^"]*)"/g;
            const imgSrc = regex.exec(outerText)[1];
            const imgUri = Object.keys(this.contentUris).find(key => this.contentUris[key] === imgSrc);
            this.mainCoverImageUrl = imgSrc;
            this.mainCoverImageUri = imgUri;
          }
        }
      });
    }

    this.currentContentData = {
      'author': {
        'slug': this.accountService.accountInfo.publicKey,
        'first_name': this.accountService.accountInfo.firstName,
        'last_name': this.accountService.accountInfo.lastName,
        'image': this.accountService.accountInfo.image
      },
      'published': '1563889376',
      'title': this.titleText,
      'tags': [
        '2017',
        'DEVELOPER',
        'FULLSTACK'
      ],
      'image': this.mainCoverImageUrl,
      'publication': {
        'title': 'UX Planet',
        'slug': 'ux_planet'
      },
      'view_count': '1K'
    };
  }

  initSubscribes() {
    this.contentForm.valueChanges
      .pipe(
        tap(() => this.initSubmitFormView()),
        debounceTime(3000),
        map(() => {
          if (!this.isSubmited) {
            this.saveDraft(this.draftId);
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        },
        err => console.log(err)
      );

    this.draftService.draftData$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((draft) => {
        if (draft) {
          this.hasDraft = true;
          const message = this.translateService.instant('content.draft_saved');
          this.draftId = draft.id;
          if (!this.contentId) {
            this.contentId = this.draftId;
          }
        }
      });
  }

  saveDraft(id = null) {
    const newDraft: any = {
      title: this.titleText || '',
      content: this.contentForm.value.content || '',
      publication: this.contentForm.value.publication,
      contentUris: this.contentUris || {}
    };

    if (id) {
      this.draftService.update(id, newDraft);
    } else {
      this.draftService.create(newDraft);
    }
  }

  initTitleFroala($event) {
    this.editorTitleInitObject = $event;
    this.editorTitleInitObject.initialize();
    setTimeout(() => {
      this.editorTitleObject.$placeholder[0].textContent = this.translateService.instant('content.title');
    }, 20);
  }

  initFroala($event) {
    this.editorContentInitObject = $event;
    this.editorContentInitObject.initialize();
    setTimeout(() => {
      this.editorContentObject.$placeholder[0].textContent = this.translateService.instant('content.content');
    }, 20);
  }

  onShowStepForm(flag: boolean) {
    if (flag && this.showStoryForm == true) {
      this.changeStep();
    } else {
      this.submitStep = 1;
      this.boostField = false;
      this.boostView = 'boost';
    }
    this.showStoryForm = flag;
  }

  onBoostToggle() {
    this.boostField = !this.boostField;
  }

  changeStep() {
    if (this.submitStep == 1) {
      this.submitStep = 2;
    } else if (this.submitStep == 2) {
      this.submit();
    }
  }

  changeBoostView(event) {
    this.boostView = event.slug;
  }

  onPasswordChange(event) {
    this.contentForm.controls['password'].setValue(event.value);
  }

  submit() {
    if (!this.contentForm.value.content) {
      this.submitError = true;
      return false;
    }
    const password = this.contentForm.value.password;
    const contentTitle = (this.titleText) ? `<h1>${this.titleText}</h1>` : '';
    let uploadedContentHtml = '';
    const contentBlocks = this.editorContentObject.html.blocks();
    const calls = [];

    const titleBlocks = this.editorTitleObject.html.blocks();
    const allContentBlocks = [ ...titleBlocks, ...contentBlocks];

    allContentBlocks.forEach((node) => {
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

        this.contentForm.value.content = this.contentForm.value.content.replace(/contenteditable="[^"]*"/g, '');

        if (Object.keys(this.contentUris).length) {
          this.contentService.signFiles(Object.keys(this.contentUris), password)
            .pipe(
              switchMap((data: any) => {
                return this.submitContent(contentData, password);
              }),
              switchMap((data: any) => {
                return (this.boostField) ? this.contentService.contentBoost(this.uploadedContentUri, this.boostPrice, this.boostDays, password) : of(data);
              })
            ).subscribe(data => {
              this.afterContentSubmit();
            },
            error => {
              this.submitError = true;
              console.log('error 1 - ', error);
            });
        }
      },
      error => {
        console.log('error 2 - ', error);
      });
  }

  afterContentSubmit() {
    if (this.draftId) {
      this.draftService.delete(this.draftId).subscribe();
    }
    this.router.navigate(['/content/mycontent']);
  }

  private submitContent(contentData, password) {
    this.uploadedContentUri = '';
    return this.contentService.unitUpload(contentData)
      .pipe(
        switchMap((data: any) => {
          this.uploadedContentUri = data.uri;
          return this.contentService.unitSign(data.channelAddress, this.contentId, data.uri, Object.keys(this.contentUris), password);
        }),
        switchMap((data: any) => this.contentService.publish(this.uploadedContentUri, this.contentId))
      );
  }

  onRangeChange(event) {
    this.boostPrice = event.target.value;
  }

  tabChange(event) {
    this.boostDays = event;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
