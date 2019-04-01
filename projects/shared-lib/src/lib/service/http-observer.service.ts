import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpObserverService {

  constructor() { }

  observerCall(name: string, request, refresh: boolean = false): Observable<any> {
    if (!refresh && this.hasOwnProperty(name)) {
      return of(this[name]);
    } else {
      return request
        .pipe(
          map(data => {
            this[name] = data;
          })
        );
    }
  }
}

