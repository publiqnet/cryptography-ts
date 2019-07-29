import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../core/services/account.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ContentService } from '../../core/services/content.service';
import { Router } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-newcontent',
  templateUrl: './newcontent.component.html',
  styleUrls: ['./newcontent.component.scss']
})
export class NewContentComponent implements OnInit, OnDestroy {
  showBoost: boolean = false;
  boostField: boolean = false;
  public contentId: number;
  private editorObject;
  private editorInitObject;
  private editorContentObject;
  public titleMaxLenght = 120;
  contentUrl = environment.backend + '/api/file/upload';
  public contentForm: FormGroup;
  contentUris = {};
  title: string;
  content: string;
  publication: string;
  contentOptions: object;
  public boostDropdownData = [];
  public boostPostData = {};
  public boostPostDataImage = {};
  public boostTab = [];
  public mainCoverImageUri: string;
  public mainCoverImageUrl: string;
  public submitStep: number = 1;
  public boostView = 'boost';
  public stepperData = [];

  constructor(
    private router: Router,
    public accountService: AccountService,
    private formBuilder: FormBuilder,
    public translateService: TranslateService,
    private contentService: ContentService
  ) {
  }

  ngOnInit() {
    this.initDefaultData();
    this.buildForm();
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
      publication: new FormControl(this.publication || 'none')
    });
  }

  initDefaultData() {
    this.boostPostData = {
      'slug': '5ceb9fc82765246c6cc55b47',
      'author': {
        'slug': '1.0.2',
        'first_name': 'Gohar',
        'last_name': 'Avetisyan',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK',
        'fullName': 'Gohar Avetisyan'
      },
      'created': '11 dec 2019',
      'published': '1563889376',
      'title': 'In the flesh: translating 2d scans into 3d prints',
      'tags': [
        '2017',
        'DEVELOPER',
        'FULLSTACK'
      ],
      'view_count': '1K'
    };

    this.boostPostDataImage = {
      'slug': '5ceb9fc82765246c6cc55b47',
      'author': {
        'slug': '1.0.2',
        'first_name': 'Gohar',
        'last_name': 'Avetisyan',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      'created': '11 dec 2019',
      'published': '1563889376',
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

    this.boostTab = [
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
          this.editorObject = e;
          this.editorContentObject = editor;
        },
        'froalaEditor.html.set': function (e, editor) {
          editor.events.trigger('charCounter.update');
        },
        'froalaEditor.contentChanged': (e, editor) => {
          // this.currentEditorLenght = this.calculateContentLength(editor.html.get());
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

  initFroala($event) {
    this.editorInitObject = $event;
    this.editorInitObject.initialize();
    setTimeout(() => {
      this.editorContentObject.$placeholder[0].textContent = this.translateService.instant('content.content');
    }, 20);
  }

  onShowStepForm(flag: boolean) {
    this.showBoost = flag;
  }

  onBoostToggle() {
    this.boostField = !this.boostField;
  }

  changeStep(step = 2) {
    this.submitStep = step;
  }

  changeBoostView(event) {
    this.boostView = event.slug;
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
    this.accountService.getAccountData();
    // if (this.draftId) {
    //   this.draftService.delete(this.draftId).subscribe();
    // }
    // if (this.boostInfo && this.boostInfo.boostEnabled) {
    //   this.contentService.articleBoost(this.password, )
    // }
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

  ngOnDestroy() {

  }
}
