import { Injectable } from '@angular/core';
import { DraftData, IDraft } from './models/draft';
import { environment } from '../../../environments/environment';
import { HttpHelperService, HttpMethodTypes, HttpObserverService } from 'shared-lib';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class DraftService {

  draftData$ = new Subject<any>();
  draftData: DraftData = null;

  private observers: object = {
    'getUserDrafts': { name: '_getUserDrafts', refresh: false }
  };

  private readonly url = `${environment.backend}/api`;

  constructor(
    private httpHelperService: HttpHelperService,
    private httpObserverService: HttpObserverService
  ) {

  }

  public set RefreshObserver(name: any) {
    if (this.observers.hasOwnProperty(name)) {
      this.observers[name].refresh = true;
    }
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
          this.DraftData = data;
          this.RefreshObserver = 'getUserDrafts';
        },
        error => {
          console.log(error);
          // this.errorService.handleError('addDraft', error, url);
        }
      );
  }

  update(id: number, draft: IDraft): void {
    const url = this.url + `/draft/${id}`;

    this.httpHelperService.call(HttpMethodTypes.post, url, draft)
      .subscribe(
        (data) => {
          this.DraftData = data;
          this.RefreshObserver = 'getUserDrafts';
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
    const callData = this.observers['getUserDrafts'];
    return this.httpObserverService.observerCall(callData.name, this.httpHelperService.call(HttpMethodTypes.get, url)
      .pipe(
        filter(data => data != null),
        map(data => {
          callData.refresh = false;
          return data.map(draft => new DraftData(draft));
        })
      ), callData.refresh);
  }

  delete(id: number): Observable<any> {
    const url = this.url + `/draft/${id}`;
    return this.httpHelperService.call(HttpMethodTypes.delete, url);
  }

  deleteAll(): Observable<any> {
    const url = this.url + `/drafts`;
    return this.httpHelperService.call(HttpMethodTypes.delete, url);
  }
}
