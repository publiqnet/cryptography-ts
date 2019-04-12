import { throwError as observableThrowError,  Observable, Subject, of } from 'rxjs';
import { Inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Block } from './block';
import { Account } from './block/account/account';
import * as moment from 'moment';
import { AccountHistory } from './block/account/accountHistory';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable()
export class ApiService {

    ws: Promise<WebSocket>;
    observables = {};
    callIndex = 1;

    blocks: Map<number, Block> = new Map;

    accountHistory = new Subject<any>();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {

        // WebSocket should be used only in browser
        if (isPlatformBrowser(this.platformId)) {
            // connect to network
            this.ws = new Promise((resolve, error) => {
                const ws = new WebSocket(environment.socket_endpoint);
                ws.onopen = () => {
                    resolve(ws);
                };
            });

            // listen to response
            this.ws.then(ws => ws.onmessage = (ev) => {
                const _data = JSON.parse(ev.data);
                this.observables[_data.id].next(_data.result);
                this.observables[_data.id].complete();
                delete this.observables[_data.id];
            });
        }
    }

    private call(obj: any): Observable<any> {
        return new Observable(observer => {
            // save index of observable
            obj.id = this.callIndex;
            this.observables[this.callIndex++] = observer;

            ///
            this.ws.then(ws => ws.send(JSON.stringify(obj)));
        });
    }

    getAccount(id_or_name: string): Observable<Account> {

        // get by id
        if (id_or_name.substr(0, 4) === '1.2.') {
            return this.call({
                'method': 'call',
                'params': [0, 'get_accounts', [[id_or_name]]]
            }).pipe(map(accounts => {
                if (accounts[0]) {
                    if (isDevMode()) {
                        console.log('account---', accounts[0]);
                    }
                    return new Account(accounts[0]);
                }

                return null;
            }));
        } else {
            return this.call({
                'method': 'call',
                'params': [0, 'get_account_by_name', [id_or_name]]
            }).pipe(map(account => {
                if (account) {
                    if (isDevMode()) {
                        console.log('account---', account);
                    }
                    return new Account(account);
                }

                return null;
            }));
        }

    }

    loadAccountHistory(id_or_name: string): void {
        // get by id
        if (id_or_name.substr(0, 4) === '1.2.') {
            this.getAccount(id_or_name).subscribe((account: Account) => {
                this.loadAccountHistory(account.name);
            });
        } else {
            this.call({
                'method': 'call',
                'params': [0, 'search_account_history', [id_or_name, '', '0.0.0', 100]]
            }).subscribe(history => {

                if (history && history.length) {

                    const historyArray = [];
                    history.map((res) => {
                        historyArray.push(new AccountHistory(res));
                    });
                    if (isDevMode()) {
                        console.log(id_or_name, historyArray);
                    }

                    this.accountHistory.next(historyArray);
                } else {
                    this.accountHistory.next(null);
                }
            });
        }
    }

    getBlock(id: number): Observable<Block> {
        // check if it already cached
        if (this.blocks.has(id)) {
            return of(this.blocks.get(id));
        }
        return this.call({
            'method': 'call',
            'params': [0, 'get_block', [id]]
        }).pipe(map(block => {
            if (block) {
                block.block_number = id;
                const b = new Block(block);
                this.blocks.set(id, b);
                return b;
            }

            throw observableThrowError('Block was not found!');
        }));
    }

    getBlocks(id: number[]): Observable<Block[]> {
        return this.call({
            'method': 'call',
            'params': [0, 'get_blocks', [id]]
        }).pipe(map(blocks => blocks.map(block => {
            if (block[1]) {
                const b = new Block(block[1]);
                this.blocks.set(b.block_id, b);
                return b;
            }

            return null;
        })));
    }

    getHeadBlock(): Observable<Block> {
        return new Observable(observer => {
            this.call({
                'method': 'call',
                'params': [0, 'get_head_block', []]
            }).subscribe(block => {
                if (block) {
                    observer.next(new Block(block));
                } else {
                    observer.error('no head block!');
                }
            });
        });
    }

    getNearestBlock(date: Date): Observable<Block> {
        return new Observable(observer => {
            this.call({
                'method': 'call',
                'params': [0, 'get_nearest_block', [moment(date).format('YYYY-MM-DDTHH:mm:ss')]]
            }).subscribe(block => {
                if (block) {
                    observer.next(new Block(block));
                } else {
                    observer.error('no head block!');
                }
            });
        });
    }

    getContentHistory(dsId: string): Observable<any> {
        return new Observable(observer => {
            this.call({
                'method': 'call',
                'params': [0, 'get_content_history', [dsId]]
            }).subscribe(data => {
                if (data) {
                    observer.next(data);
                }
            });
        });
    }
}
