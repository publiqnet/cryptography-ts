import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { TransferHttpCacheModule } from '@nguniversal/common';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { StoryModule } from './story/story.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthorModule } from './author/author.module';
import { ArticleService } from './core/services/article.service';
import { AccountService } from './core/services/account.service';
import { ContentService } from './core/services/content.service';
import { PublicationModule } from './publication/publication.module';
import { PublicationService } from './core/services/publication.service';
import { LanguageGuard } from './guards/language.guard';
import { RequestsInterceptor } from './core/services/requests.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: 'publishing-platform-app' }),
        TransferHttpCacheModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        CoreModule,
        AuthorModule,
        StoryModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        PublicationModule,
        Angulartics2Module.forRoot()
    ],
    providers: [
        ArticleService,
        ContentService,
        AccountService,
        PublicationService,
        LanguageGuard,
        TranslateService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: RequestsInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        @Inject(APP_ID) private appId: string
    ) {
        const platform = isPlatformBrowser(platformId)
            ? 'in the browser'
            : 'on the server';
    }
}
