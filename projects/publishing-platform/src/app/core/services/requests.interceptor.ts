import { Inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChannelService } from './channel.service';
import { isPlatformBrowser } from '@angular/common';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AccountService } from './account.service';
import { filestorageLink } from '../../../environments/parameters';


@Injectable()
export class RequestsInterceptor implements HttpInterceptor {
  constructor(private channelService: ChannelService, @Inject(PLATFORM_ID) private platformId: Object, private accountService: AccountService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isPlatformBrowser(this.platformId)) {
      if (request.url.indexOf(filestorageLink) !== -1 ) {
        request.headers.delete('X-API-CHANNEL');
        return next.handle(request);
      }
      if (!request.headers.has('X-API-CHANNEL')) {
        request = request.clone({
          setHeaders: {
            'X-API-CHANNEL': this.channelService.channel || 'stage'
          }
        });
      }
    }

    return next.handle(request)
      .pipe(tap(
        (event: HttpEvent<any>) => { },
        (err: any) => {
          if (isPlatformBrowser(this.platformId) && err instanceof HttpErrorResponse) {
            if (err.status === 401 && this.accountService.accountInfo) {
              this.accountService.logout();
            }
          }
        }
      ));
  }
}
