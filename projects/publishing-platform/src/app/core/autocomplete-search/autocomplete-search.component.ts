import { Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { isPlatformBrowser } from '@angular/common';

import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { ArticleService } from '../services/article.service';
import { Broadcaster } from '../../broadcaster/broadcaster';
import { AccountService } from '../services/account.service';
import { OrderOptions } from '../services/content.service';
import { ErrorEvent, ErrorService } from '../services/error.service';
import { environment } from '../../../environments/environment';

const COMMA = 188;

@Component({
    selector: 'app-autocomplete-search',
    templateUrl: './autocomplete-search.component.html',
    styleUrls: ['./autocomplete-search.component.scss']
})
export class AutocompleteSearchComponent
    implements OnChanges, OnInit, OnDestroy {
    filteredContent: Array<any>;
    selectable = true;
    removable = true;
    addOnBlur = false;
    imagePath: string = environment.backend + '/uploads/publications/';
    contentReady: boolean;

    @Input() searchBarStatus;
    @ViewChild('tagInput') public tagInput: ElementRef;

    // Enter, comma
    separatorKeysCodes = [ENTER, COMMA];
    tags = [];
    currentTags = [];

    termArticlesSubscription: Subscription = Subscription.EMPTY;
    errorEventEmitterSubscription: Subscription = Subscription.EMPTY;
    broadcasterSubscription: Subscription = Subscription.EMPTY;

    public keyUp = new Subject<string>();
    keyUpSubscription: Subscription = Subscription.EMPTY;

    constructor(
        private articleService: ArticleService,
        private router: Router,
        private broadcaster: Broadcaster,
        private accountService: AccountService,
        private element: ElementRef,
        private errorService: ErrorService,
        @Inject(PLATFORM_ID) private platformId: Object,
        public translate: TranslateService
    ) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.keyUpSubscription = this.keyUp
                .pipe(
                    map(event => {
                        // @ts-ignore
                        return event.target.value;
                    }),
                    tap(val => {
                      if (val.length === 0) {
                        this.contentReady = false;
                      }
                    }),
                    debounceTime(750),
                    distinctUntilChanged()
                )
                .subscribe(text => {
                    if (text && text.length >= 3) {
                        if (this.currentTags.length > 0) {
                            text = (this.currentTags.join(' ').trim() + ' ' + text).trim();
                        }
                        this.articleService.getArticlesByTerm(
                            text,
                            OrderOptions.default,
                            '',
                            '0.0.0',
                            '',
                            10
                        );
                    }
                });

            this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
                (data: ErrorEvent) => {
                    if (data.action === 'getArticlesByTerm') {
                        console.log('getArticlesByTerm-error', data.message);
                    }
                }
            );

            this.broadcasterSubscription = this.broadcaster
                .on<any>('searchTags')
                .subscribe(data => {
                    this.accountService.showSearchBar$.emit(true);
                    if (!this.tags.includes(data.trim())) {
                        this.tags.push(data.trim());
                        this.currentTags.push(data.trim());
                        this.filteredContent = [];
                    }
                    this.showResult();
                });

            setTimeout(
                () =>
                    this.element.nativeElement
                        .querySelector('mat-form-field')
                        .classList.remove('mat-form-field-hide-placeholder'),
                20
            );

            this.termArticlesSubscription = this.articleService.termArticlesChanged.subscribe(
                response => {
                  if (response && response.length > 0) {
                        this.filteredContent = response.filter(article => {
                            return (
                                article.accounts_list ||
                                article.more_accounts ||
                                article.contents_list ||
                                article.more_contents ||
                                article.publications_list ||
                                article.more_publications ||
                                (article.meta && article.meta.title != ' ') ||
                                article.slug
                            );
                        });
                  } else {
                        this.filteredContent = [];
                    }
                    this.contentReady = true;
                    this.tagInput.nativeElement.focus();
                }
            );
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.searchBarStatus) {
            setTimeout(_ => this.tagInput.nativeElement.focus());
        }
        if (!this.searchBarStatus) {
            this.tags = [];
            this.currentTags = [];
            this.filteredContent = [];
        }
    }

    optionSelected(event) {
        const isAccount = event.option._element.nativeElement.getAttribute(
            'data-is_account'
        );
        const isContent = event.option._element.nativeElement.getAttribute(
            'data-is_content'
        );
        const isPublication = event.option._element.nativeElement.getAttribute(
            'data-is_publication'
        );
        const moreAccounts = event.option._element.nativeElement.getAttribute(
            'data-more_accounts'
        );
        const morePublications = event.option._element.nativeElement.getAttribute(
            'data-more_publications'
        );
        const moreContents = event.option._element.nativeElement.getAttribute(
            'data-more_contents'
        );

        let searchTerm = '';
        if (this.currentTags.join(' ').trim()) {
            searchTerm = this.currentTags.join(' ').trim();
        } else if (this.tagInput.nativeElement.value.trim()) {
            searchTerm = this.tagInput.nativeElement.value.trim();
        }

        if (moreAccounts === 'true' && searchTerm) {
            this.router.navigate([
                `/search/account/${searchTerm}`
            ]);
        } else if (moreContents === 'true' && searchTerm) {
            this.router.navigate([
                `/search/content/${searchTerm}`
            ]);
        } else if (morePublications === 'true' && searchTerm) {
            this.router.navigate([
                `/search/publication/${searchTerm}`
            ]);
        } else if (isAccount === 'true' && event.option.value) {
            this.router.navigate([
                `/a/${event.option.value.name}`
            ]);
        } else if (isPublication === 'true' && event.option.value) {
            this.router.navigate([
                `/p/${event.option.value.slug}`
            ]);
        } else if (isContent === 'true' && event.option.value && event.option.value.ds_id) {
            this.articleService.getArticleByIdDataChanged.next(event.option.value);
            this.router.navigate([
                `/s/${event.option.value.ds_id}`
            ]);
        } else {
            return false;
        }
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our person
        if (value && (value || '').trim() && this.tags.length < 5) {
            if (!this.currentTags.includes(value.trim())) {
                this.tags.push(value.trim());
                this.currentTags.push(value.trim());
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.showResult();
    }

    remove(item_tag: any): void {
        const index = this.tags.indexOf(item_tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
            this.currentTags.splice(index, 1);
        }

        if (this.currentTags.length == 0) {
            this.filteredContent = [];
            return;
        } else {
            this.showResult();
        }
    }

    showResult() {
        if (this.currentTags.length == 0) {
            return;
        }

        const searchTerm = this.currentTags.join(' ').trim();

        this.articleService.getArticlesByTerm(
            searchTerm,
            OrderOptions.default,
            '',
            '0.0.0',
            '',
            10
        );
    }

    checkImageHashExist(content) {
        const account = content ? content : '';
        const meta = account.meta ? account.meta : '';
        const image = meta.image_hash ? meta.image_hash : '';
        return !!(
            account &&
            meta &&
            image &&
            image !== '' &&
            !image.startsWith('http://127.0.0.1') &&
            image.indexOf('_thumb') !== -1
        );
    }

    checkContentImageHashExist(content) {
        const meta = content.meta ? content.meta : '';
        const image = meta.thumbnail_hash ? meta.thumbnail_hash : '';
        return !!(
            content &&
            meta &&
            image &&
            image !== '' &&
            !image.startsWith('http://127.0.0.1') &&
            image.indexOf('_thumb') !== -1
        );
    }

    checkPublicationImageExist(content) {
        const logo = content.logo ? content.logo : '';
        return !!(
            content &&
            logo &&
            logo !== '' &&
            logo !== 'null' &&
            !logo.startsWith('http://127.0.0.1')
        );
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.termArticlesSubscription.unsubscribe();
            this.errorEventEmitterSubscription.unsubscribe();
            this.broadcasterSubscription.unsubscribe();
            this.keyUpSubscription.unsubscribe();
        }
    }
}
