import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    public isHistoryArticle = false;
    public historyArticleData = '';
    public searchBarOpen = false;

    articleEventEmiterSubscription: Subscription = Subscription.EMPTY;

    constructor(private router: Router,
                private articleService: ArticleService) {
    }

    ngOnInit() {
        this.articleEventEmiterSubscription = this.articleService.articleEventEmiter.subscribe((data) => {
            this.isHistoryArticle = data.isHistory;
            if (this.isHistoryArticle && data.mainArticleHash) {
                this.historyArticleData = data.mainArticleHash;
            }
        });
    }

    /**
     * Currently is is being used to navigate to blocks.
     *
     * @param search
     */
    doSearch(search) {

        search = search.trim();

        this.searchBarOpen = false;

        if (search.length > 0) {
            if (search.substr(0, 4) === '1.2.' || search.substr(0, 3) === 'PBQ') {
                this.router.navigate(['/block/account', search]);
            } else if ((/^\d+$/.test(search))) {
                this.router.navigate(['/block', search]);
            } else if (search.length > 20) { // 20 is article ds_id approximate length
                this.router.navigate(['/article', search]);
            } else {
                this.router.navigate(['/page-not-found']);
            }
        }
    }

    redirectToHomePage(event: any) {
        event.preventDefault();

        this.router.navigate(['']);
    }

    toggleSearch() {
        if (window && window.innerWidth > 768) { return; }

        this.searchBarOpen = !this.searchBarOpen;
    }

    articleUpdatedVersion(event: any) {
        event.preventDefault();
        if (this.historyArticleData) {
            this.router.navigate([`/article/${this.historyArticleData}`]);
        }
    }

    ngOnDestroy() {
        this.articleEventEmiterSubscription.unsubscribe();
    }
}
