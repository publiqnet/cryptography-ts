import { Injectable } from '@angular/core';
import { DraftData, IDraft } from './models/draft';
import { environment } from '../../../environments/environment';
import { HttpHelperService, HttpMethodTypes } from 'shared-lib';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class DraftService {

  draftData$ = new Subject<any>();
  draftData: DraftData = null;

  private readonly url = `${environment.backend}/api`;

  constructor(
    private httpHelperService: HttpHelperService
  ) {
  }

  private set DraftData(draftData) {
    this.draftData = draftData;
    this.draftData$.next(this.draftData);
  }

  create(draft: IDraft): void {
    const url = this.url + `/draft/create`;
    this.httpHelperService.call(HttpMethodTypes.put, url, draft)
      .subscribe(
        data => {
          console.log('data - ', data);
          this.DraftData = data;
        },
        error => {
          console.log(error);
          // this.errorService.handleError('addDraft', error, url);
        }
      );
  }

  update(id: string, draft: IDraft): void {
    const url = this.url + `/draft/${id}`;

    this.httpHelperService.call(HttpMethodTypes.post, url, draft)
      .subscribe(
        (data) => {
          this.DraftData = data;
        },
        error => {
          console.log(error);
          // this.errorService.handleError('addDraft', error, url);
        }
      );
  }

  get(id: string): Observable <DraftData> {
    const url = this.url + `/draft/${id}`;
    return this.httpHelperService.call(HttpMethodTypes.get, url).pipe(map(data => new DraftData(data)));
  }

  getUserDrafts(): Observable<DraftData[]> {
    const url = this.url + `/drafts`;
    return this.httpHelperService.call(HttpMethodTypes.get, url)
      .pipe(
        filter(data => data != null),
        map(data => data.map(draft => new DraftData(draft)))
      );
  }

  delete(id: string): Observable<any> {
    const url = this.url + `/draft/${id}`;
    return this.httpHelperService.call(HttpMethodTypes.delete, url);
  }

  deleteAll(): Observable<any> {
    const url = this.url + `/drafts`;
    return this.httpHelperService.call(HttpMethodTypes.delete, url);
  }
}
