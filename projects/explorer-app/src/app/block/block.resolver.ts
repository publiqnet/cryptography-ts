import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Block } from '../block';
import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable()
export class BlockResolver implements Resolve<Block> {

    constructor(private api: ApiService, private router: Router,
                private route: ActivatedRoute) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Block | Observable<Block> | Promise<Block> {
        return this.api.getBlock(route.params['id'])
            .pipe(catchError(error => {
                this.router.navigate(['/block/not-exists']);
                return of(null);
            }));
    }
}
