import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Buffer } from 'buffer';
import { Content } from './models/content';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ArticleService {

    constructor(private http: HttpClient,
                private apiService: ApiService) {
    }
    getArticleByIdDataChanged = new BehaviorSubject<any>(null);
    getArticleByIdData;

    getArticleHistoryByIdDataChanged = new BehaviorSubject<any>(null);
    getArticleHistoryByIdData;

    public articleEventEmiter: EventEmitter<any> = new EventEmitter(true);
    public isHistoryArticleOpened = false;

    private static generatTags(metaTags) {
        let result;
        if (typeof metaTags === 'string') {
            result = [{display: metaTags, value: metaTags}];
        } else if (Array.isArray(metaTags)) {
            result = metaTags.map(tag => {
                return {display: tag, value: tag};
            });
        } else if (typeof metaTags === 'undefined') {
            result = [];
        }

        return result;
    }


    getArticleById(id: string): void {
        const url = `${environment.ds_backend}/content/${id}`;
        this.http.get(url).subscribe((data: Content) => {
            if (data && data.created && data.created.slice(-1) !== 'Z') {
                data.created = data.created + 'Z';
            }
            if (data['content']) {
                data['meta'].tags = ArticleService.generatTags(data['meta'].tags);

                data['content'].data = JSON.parse(new Buffer(new Buffer(data['content'].data).toString(), 'hex').toString());

                this.getArticleByIdData = data;
                this.getArticleByIdDataChanged.next(this.getArticleByIdData);
            } else {
                console.log('error');
            }
        }, error => console.log('error'));
    }

    getArticleHistoryById(id: string): void {
        const url = `${environment.ds_backend}/content/${id}`;
        this.http.get(url).subscribe((data: Content) => {
            if (data && data.created && data.created.slice(-1) !== 'Z') {
                data.created = data.created + 'Z';
            }
            if (data['content']) {
                data['meta'].tags = ArticleService.generatTags(data['meta'].tags);

                data['content'].data = JSON.parse(new Buffer(new Buffer(data['content'].data).toString(), 'hex').toString());

                this.getArticleHistoryByIdData = data;
                this.getArticleHistoryByIdDataChanged.next(this.getArticleHistoryByIdData);
            } else {
                console.log('error');
            }
        }, error => console.log('error'));
    }
}
