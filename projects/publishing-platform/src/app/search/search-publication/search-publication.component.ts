import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';

import { ArticleService } from '../../core/services/article.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-search-content',
    templateUrl: './search-publication.component.html',
    styleUrls: ['./search-publication.component.scss']
})
export class SearchPublicationComponent implements OnInit, OnDestroy {
    filteredPublications: Array<any>;
    searchTerm = '';
    public loading = true;
    public hasChanges = false;
    filePath = environment.backend + '/uploads/publications/';

    getPublicationsByTermSubscription: Subscription = Subscription.EMPTY;
    errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

    constructor(
        private articleService: ArticleService,
        private router: Router,
        private errorService: ErrorService,
        private activatedRoute: ActivatedRoute,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
                (data: ErrorEvent) => {
                    if (data.action === 'getPublicationsByTerm') {
                    }
                }
            );

            this.activatedRoute.params.subscribe(params => {
                this.hasChanges = false;
                if (params['term'] !== 'undefined') {
                    this.searchTerm = params['term'];
                    this.articleService.getPublicationsByTerm(this.searchTerm);
                } else {
                    this.router.navigate(['/']);
                }
            });

            this.getPublicationsByTermSubscription = this.articleService.getPublicationDataByTermChanged.subscribe(
                response => {
                    this.loading = true;
                    this.filteredPublications = response.filter(publication => {
                        return publication.title != ' ';
                    });
                    this.loading = false;
                    this.hasChanges = true;
                }
            );
        }
    }

    goToDetail(slug, status) {
        this.router.navigate([`/p/${slug}`]);
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.hasChanges = false;
            this.getPublicationsByTermSubscription.unsubscribe();
            this.errorEventEmitterSubscription.unsubscribe();
        }
    }
}
