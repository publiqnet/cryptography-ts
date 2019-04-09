import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Account } from '../services/models/account';
import { AccountService } from '../services/account.service';


@Pipe({
  name: 'id_to_username'
})
export class IdToUsernamePipe implements PipeTransform {
  constructor(public api: AccountService) {}

  transform(id: string): Observable<string> {
    // console.log(id);
    // TODO: this seems wrong, if done in a loop, this will return the name of the last authorAccount
    this.api.loadRpcAccount(id);
    return this.api.authorAccountChanged.pipe(
      map((account: Account) => (account ? account.publicKey : ''))
    );
  }
}
