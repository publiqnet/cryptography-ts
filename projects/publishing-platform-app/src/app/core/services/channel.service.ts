import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs';

import { ErrorService } from './error.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ChannelService {
    public channel: string;
    public copyright = '';
    public pixelId = '';
    public pages = null;
    public shareThis = false;
    public channelConfig = {};

    channelAuthorsChanged = new Subject<any>();
    private channelAuthors = [];

    public mainTitle = '';

    constructor(private http: HttpClient, private errorService: ErrorService) {
    }

    static isChannelMain(channel) {
      return ['demo', 'stage', 'testnet', 'testnet', 'stage-mainnet', 'mainnet', null].includes(channel);
    }

    getChannelAuthors(): any[] {
        return this.channel && this.channelAuthors.length
            ? this.channelAuthors.slice()
            : [];
    }

    getChannel(channel) {
      return this.http.get(`${environment.backend}/api/v1/channel/settings`, {headers: {'X-API-CHANNEL' : channel}});
    }

    setChannelAuthors(channelAuthors: any[]): void {
        this.channelAuthors = channelAuthors;
        this.channelAuthorsChanged.next(this.channelAuthors.slice());
    }

    loadChannelAuthors(): void {
        if (ChannelService.isChannelMain(this.channel)) {
          this.channelAuthors = [];
          this.channelAuthorsChanged.next(this.channelAuthors.slice());
          return;
        }
        const url = environment.backend + '/api/v1/channel/authors';
        this.http.get(url, {headers: {'X-API-CHANNEL': this.channel}}).subscribe(
            (result: any[]) => {
              const data = result['authors'];
                if (Array.isArray(data)) {
                    const authors = [];
                    data.forEach(obj => {
                        authors.push(obj.user.username ? obj.user.username : obj.user.publiqId);
                    });
                    this.channelAuthors = authors;
                    this.channelAuthorsChanged.next(this.channelAuthors.slice());
                }
            },
            error => this.errorService.handleError('loadChannelAuthors', error, url)
        );
    }

    /*loadAllChannels(): void {
        if(isPlatformBrowser(this.platformId)){
            let url = environment.backend + '/api/v1/channels';
            this.http.get(url).subscribe((data: any[]) => {
              if(data){
                this.setAllChannels(data);
              }
            }, error => this.errorService.handleError('getAllChannels', error, url));
        }
      }

      setAllChannels(data): void{
        if(data && data.length){
          let channelsList = {};
          data.forEach((obj) => {
            channelsList[obj.domain] = obj.name;
          });
          this.allChannels = channelsList;
        } else {
          this.loadAllChannels();
        }

      }*/

    /*getChannelByKey(key: string){
        return (key && this.allChannels && this.allChannels[key]) ? this.allChannels[key] : 'PUBLIQ'
      }*/
}
