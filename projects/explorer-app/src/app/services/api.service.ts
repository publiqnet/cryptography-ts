import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Block } from './models/block';
import { environment } from '../../../../wallet-app/src/environments/environment';
import { HttpHelperService, HttpMethodTypes } from 'helper-lib';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable()
export class ApiService {

  public blockUrl = `${environment.backend}/api`;

  constructor(private httpHelperService: HttpHelperService) {}

  search(search: string) {
    const url = `${this.blockUrl}/search/${search}`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url);
  }

  loadBlocks(fromHash: string = '', count: number = 7): Observable<any> {
    const url = `${this.blockUrl}/blocks/${count}/${fromHash}`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url)
      .pipe(
        map((blockInfo: any) => {
          blockInfo.blocks = blockInfo.blocks.map(b => new Block(b));
          return blockInfo;
        }));
  }

  getNearestBlock(date: Date, fromHash: string = null, count: number = 7): Observable<Block> {
    const selectedDate = moment(date);
    const year = selectedDate.year();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const url = `${this.blockUrl}/blocks/${year}/${month}/${day}/${count}/${fromHash}`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url)
      .pipe(
        map((blockInfo: any) => {
          blockInfo.blocks = blockInfo.blocks.map(b => new Block(b));
          return blockInfo;
        }));
  }

  getBlock(blockHash: string): Observable<Block> {
    const url = `${this.blockUrl}/block/${blockHash}`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url)
      .pipe(
        map((blockInfo: any) => {
          return blockInfo;
        }));
  }

  // getAccount(id_or_name: string): Observable<Account> {
  //
  //     // get by id
  //     if (id_or_name.substr(0, 4) === '1.2.') {
  //         return this.call({
  //             'method': 'call',
  //             'params': [0, 'get_accounts', [[id_or_name]]]
  //         }).pipe(map(accounts => {
  //             if (accounts[0]) {
  //                 if (isDevMode()) {
  //                     console.log('account---', accounts[0]);
  //                 }
  //                 return new Account(accounts[0]);
  //             }
  //
  //             return null;
  //         }));
  //     } else {
  //         return this.call({
  //             'method': 'call',
  //             'params': [0, 'get_account_by_name', [id_or_name]]
  //         }).pipe(map(account => {
  //             if (account) {
  //                 if (isDevMode()) {
  //                     console.log('account---', account);
  //                 }
  //                 return new Account(account);
  //             }
  //
  //             return null;
  //         }));
  //     }
  //
  // }

  // loadAccountHistory(id_or_name: string): void {
  //     // get by id
  //     if (id_or_name.substr(0, 4) === '1.2.') {
  //         this.getAccount(id_or_name).subscribe((account: Account) => {
  //             this.loadAccountHistory(account.name);
  //         });
  //     } else {
  //         this.call({
  //             'method': 'call',
  //             'params': [0, 'search_account_history', [id_or_name, '', '0.0.0', 100]]
  //         }).subscribe(history => {
  //
  //             if (history && history.length) {
  //
  //                 const historyArray = [];
  //                 history.map((res) => {
  //                     historyArray.push(new AccountHistory(res));
  //                 });
  //                 if (isDevMode()) {
  //                     console.log(id_or_name, historyArray);
  //                 }
  //
  //                 this.accountHistory.next(historyArray);
  //             } else {
  //                 this.accountHistory.next(null);
  //             }
  //         });
  //     }
  // }

  // getBlocks(id: number[]): Observable<Block[]> {
  //     return this.call({
  //         'method': 'call',
  //         'params': [0, 'get_blocks', [id]]
  //     }).pipe(map(blocks => blocks.map(block => {
  //         if (block[1]) {
  //             const b = new Block(block[1]);
  //             this.blocks.set(b.block_id, b);
  //             return b;
  //         }
  //
  //         return null;
  //     })));
  // }
  //
  // getHeadBlock(): Observable<Block> {
  //     return new Observable(observer => {
  //         this.call({
  //             'method': 'call',
  //             'params': [0, 'get_head_block', []]
  //         }).subscribe(block => {
  //             if (block) {
  //                 observer.next(new Block(block));
  //             } else {
  //                 observer.error('no head block!');
  //             }
  //         });
  //     });
  // }
  //
  // getNearestBlock(date: Date): Observable<Block> {
  //     return new Observable(observer => {
  //         this.call({
  //             'method': 'call',
  //             'params': [0, 'get_nearest_block', [moment(date).format('YYYY-MM-DDTHH:mm:ss')]]
  //         }).subscribe(block => {
  //             if (block) {
  //                 observer.next(new Block(block));
  //             } else {
  //                 observer.error('no head block!');
  //             }
  //         });
  //     });
  // }
  //
  // getContentHistory(dsId: string): Observable<any> {
  //     return new Observable(observer => {
  //         this.call({
  //             'method': 'call',
  //             'params': [0, 'get_content_history', [dsId]]
  //         }).subscribe(data => {
  //             if (data) {
  //                 observer.next(data);
  //             }
  //         });
  //     });
  // }
}
