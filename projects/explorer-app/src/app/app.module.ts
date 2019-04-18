import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpHelperService, HttpObserverService, OauthService } from 'helper-lib';
import { SharedModule } from './shared/shared.module';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Angulartics2Module } from 'angulartics2';

import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatTableModule,
  MatSortModule,
  MatExpansionModule, MatPaginatorModule
} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModule } from '@angular/cdk/layout';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TransactionModule } from './transaction/transaction.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { TemplateComponent } from './template/template.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SearchComponent } from './search/search.component';
import { BlockComponent } from './block/block.component';
import { DecimalPipe } from '@angular/common';
import { PbqPipe } from './shared/pipes/pbq/pbq.pipe';
import { ApiService } from './services/api.service';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'explorer-app' }),
    TransferHttpCacheModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
    SharedModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    SharedModule,
    AppRoutingModule,
    InfiniteScrollModule,
    NgbModule,
    LayoutModule,
    TransactionModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule
  ],
  declarations: [
    AppComponent,
    HomepageComponent,
    TemplateComponent,
    HeaderComponent,
    SearchComponent,
    FooterComponent,
    BlockComponent
  ],
  providers: [
    OauthService,
    HttpHelperService,
    HttpObserverService,
    TranslateService,
    ApiService,
    PbqPipe,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
