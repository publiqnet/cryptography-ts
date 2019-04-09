import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateUniversalLoader } from 'shared-lib';

export function translateFactory() {
  return new TranslateUniversalLoader('./dist/publishing-platform-app/assets/i18n', '.json');
}

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateFactory
      }
    }),
    ModuleMapLoaderModule,
    ServerTransferStateModule,
    FlexLayoutServerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppServerModule {
}
