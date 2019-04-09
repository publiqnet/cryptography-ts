import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpRpcService {

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    public call(obj: any): Observable<any> {
        if (isPlatformBrowser(this.platformId)) {
            obj.id = '0';
            obj.method = 'call';
            return this.http.post(environment.daemon_https_address, JSON.stringify(obj), { headers: new HttpHeaders({'Content-Type': 'application/json'}) })
                .pipe(map(res => (res && res['result']) ? res['result'] : res));
        }
    }
}
