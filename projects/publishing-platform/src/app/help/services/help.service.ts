import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { StaticContent } from '../models/staticContent';



@Injectable()
export class HelpService {
    private readonly apiUrl = `${environment.backend}/api/v1`;

    constructor(private http: HttpClient) {
    }

    getMessages(): Observable<Array<StaticContent>> {
        return this.http
            .get(`${this.apiUrl}/content/help`)
            .pipe(
                map(response => response),
                catchError(err => this.handleError(err))
            );
    }

    handleError(error: any): Observable<any> {
        if (error.status === 404) {
            error._body = '{"message": "account_not_found"}';
            return throwError(error);
        }
        return throwError(error.message || error);
    }
}
