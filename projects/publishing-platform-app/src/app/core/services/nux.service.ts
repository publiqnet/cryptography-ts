import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AccountService } from './account.service';


@Injectable()
export class NuxService {
    currentStep = new BehaviorSubject(0);
    // shouldHide = false;
    readonly apiUrl: string = `${environment.backend}/api/v1`;
    readonly keys = {
        editor: []
    };


    constructor(private http: HttpClient, private accountService: AccountService) { }

    finishNux(page: string): void {
        // this.shouldHide = true;
        this.http.post(`${this.apiUrl}/user/nux-${page}-seen`, {}, {
            headers: new HttpHeaders({ 'X-API-TOKEN': this.getAccountToken() }),
        }).subscribe();
    }

    reset(page: string) {
        this.keys[page] = [];
        // this.shouldHide = false;
        this.currentStep.next(0);
    }

    private getAccountToken() {
        return this.accountService.accountInfo &&
            this.accountService.accountInfo.token
            ? this.accountService.accountInfo.token
            : null;
    }
}
