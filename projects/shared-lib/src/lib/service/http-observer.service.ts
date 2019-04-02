import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpObserverService {

  constructor() { }

  observerCall(name: string, request, refresh: boolean = false): Observable<any> {
    return (!refresh && this.hasOwnProperty(name)) ? of(this[name]) : request.pipe(map(data => { this[name] = data; return data; }));
  }
}

