import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ChannelService } from './channel.service';

@Injectable()
export class SeoService {
  constructor(private meta: Meta, private title: Title, private channelService: ChannelService) {
  }

  generateTags(config, ogType = 'article') {
    // default values
    if (config) {
      const metadata = {
        title: config.title || this.channelService.channelConfig['title'] ||  'PUBLIQ – DECENTRALIZED MEDIA',
        description: config.description || this.channelService.channelConfig['description'] ||  `PUBLIQ is a blockchain distributed media ecosystem owned, governed and operated by a
        global independent community, whose members enjoy unlimited potential of free expression, enterprising and
        full protection of their identity and IP rights`,
        image: config.image || this.channelService.channelConfig['image'] ||  'https://publiq.network/media/images/92169.png',
        url:  config.url || this.channelService.channelConfig['url'] ||  'https://demo.publiq.site',
        site_name : config.site_name || this.channelService.channelConfig['site_name'] ||  'PUBLIQ'
      };

      this.title.setTitle(metadata.title);

      this.meta.updateTag({name: 'description', content: metadata.description});

      this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
      this.meta.updateTag({name: 'twitter:site', content: '@PUBLIQNetwork'});
      this.meta.updateTag({name: 'twitter:title', content: metadata.title});
      this.meta.updateTag({name: 'twitter:url', content: metadata.url});
      this.meta.updateTag({
        name: 'twitter:description',
        content: metadata.description
      });
      this.meta.updateTag({name: 'twitter:image', content: metadata.image});

      this.meta.updateTag({property: 'og:type', content: ogType});
      this.meta.updateTag({property: 'og:site_name', content: metadata.site_name});
      this.meta.updateTag({property: 'og:title', content: metadata.title});
      this.meta.updateTag({
        property: 'og:description',
        content: metadata.description
      });
      this.meta.updateTag({property: 'og:image', content: metadata.image});
      this.meta.updateTag({property: 'og:url', content: metadata.url});
    }
  }
}
