import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { TagDetailObject } from '../models/classes/tag.detail.object';
import { environment } from '../../../environments/environment';
import { ChannelService } from './channel.service';
import { AccountService } from './account.service';
import { ErrorService } from './error.service';
import { HttpRpcService } from './httpRpc.service';

@Injectable()
export class TagService {
  private tags: TagDetailObject[] = [];
  tagsChanged = new Subject<TagDetailObject[]>();
  private readonly apiUrl = `${environment.backend}/api/v1`;

  constructor(
    private httpRpcService: HttpRpcService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private accountService: AccountService,
    private channelService: ChannelService,
    private errorService: ErrorService
  ) {}

  /**
   * The result is being injected to balance subject
   * @param {string} account_id
   */
  public loadTags(term = '', ref = 0, limit = 0): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.channelService.channel) {
        const url =
          this.apiUrl + '/channel/tags';
        this.http
          .get<any[]>(url)
          .pipe(filter(tags => tags != null))
          .pipe(
            map(tags => {
              return tags.map(nextTag => {
                nextTag.name = nextTag.tag;
                return new TagDetailObject(nextTag);
              });
            })
          )
          .subscribe(
            tags => {
              this.tags = tags;
              this.tagsChanged.next(this.tags.slice());
            },
            error => this.errorService.handleError('getTagsError', error, url)
          );
      } else {
        this.httpRpcService
          .call({
            params: [0, 'list_tags', [term, ref, limit]]
          })
          .pipe(
            map(tags => {
              return tags.map(tag => {
                return new TagDetailObject(tag);
              });
            })
          )
          .subscribe(tags => {
            this.tags = tags;
            this.tagsChanged.next(this.tags.slice());
          });
      }
    }
  }

  getTags(): TagDetailObject[] {
    return this.tags.slice();
  }
}
