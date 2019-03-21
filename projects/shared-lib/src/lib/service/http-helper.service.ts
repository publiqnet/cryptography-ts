import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum HttpMethodTypes {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete'
}

@Injectable({
  providedIn: 'root'
})
export class HttpHelperService {

  static baseHeaders = [];

  static setBaseHeaders(headerConfigs: { headerKay: string, getHeaderValue: () => string }[]) {
    HttpHelperService.baseHeaders = headerConfigs;
  }

  constructor(private http: HttpClient) {
  }

  public customCall(
      method: HttpMethodTypes,
      url: string,
      data?: object,
      headers?: { key: string; value: string }[]
  ) {
    return this.call(method, url, data, headers, false);
  }

  public call(
      method: HttpMethodTypes,
      url: string,
      data?: object,
      headers?: { key: string; value: string }[],
      useBaseHeaders: boolean = true
  ): Observable<any> {
    const _headers = {};

    if (useBaseHeaders && HttpHelperService.baseHeaders) {
      HttpHelperService.baseHeaders.forEach(headerConfig => {
        _headers[headerConfig.headerKay] = headerConfig.getHeaderValue();
      });
    }

    if (headers) {
      headers.forEach(headerConfig => {
        _headers[headerConfig.key] = headerConfig.value;
      });
    }

    const headersData = new HttpHeaders(_headers);

    if (method === HttpMethodTypes.get || method === HttpMethodTypes.delete) {
      return this.http[method](url, {headers: headersData});
    } else {
      return this.http[method](url, data, {headers: headersData});
    }
  }
}
