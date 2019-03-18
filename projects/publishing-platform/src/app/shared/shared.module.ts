import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import {
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatCardModule,
  MatAutocompleteModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatChipsModule,
  MatTableModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSliderModule,
  MatSortModule,
  MatTabsModule,
  MatTooltipModule,
  MatNativeDateModule
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ArticleCardListComponent } from './article-card-list/article-card-list.component';
import { ArticleSmallCardListComponent } from './article-small-card-list/article-small-card-list.component';
import { ControlMessagesComponent } from './control-message/control-message.component';
import { PbqPipe } from '../core/pipes/pbq.pipe';
import { TimeIntervalPipe } from '../core/pipes/timeinterval.pipe';
import { Broadcaster } from '../broadcaster/broadcaster';
import { AccountListComponent } from './account-list/account-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ReportDialogComponent } from '../core/report-dialog/report-dialog.component';
import { LoginDialogComponent } from '../core/login-dialog/login-dialog.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { FloatPipe } from '../core/pipes/float.pipe';
import { IdToUsernamePipe } from '../core/pipes/id_to_username.pipe';
import { DomChangeDirective } from '../core/dom-change.directive';
import { HttpsPipe } from '../core/pipes/https.pipe';
import { ShortNamePipe } from '../core/pipes/shortname.pipe';
import { SettingsComponent } from './settings/settings.component';
import { SafeHtmlPipe } from '../core/pipes/safeHtml.pipe';
import { HrefToRouterLinkDirective } from '../core/directives/href-to-routerlink.directive';
import { PubTitlePipe } from '../core/pipes/pub-title.pipe';
import { SearchMemberComponent } from '../content/search-member/search-member.component';
import { NuxComponent } from './nux/nux.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/home/', '.json');
}
@NgModule({
  imports: [
    PerfectScrollbarModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTableModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    LazyLoadImagesModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    })
  ],
  declarations: [
    ArticleCardListComponent,
    ArticleSmallCardListComponent,
    AccountListComponent,
    ControlMessagesComponent,
    PageNotFoundComponent,
    PbqPipe,
    TimeIntervalPipe,
    ShortNamePipe,
    SettingsComponent,
    HttpsPipe,
    FloatPipe,
    IdToUsernamePipe,
    SafeHtmlPipe,
    ReportDialogComponent,
    LoginDialogComponent,
    NotificationDropdownComponent,
    DomChangeDirective,
    HrefToRouterLinkDirective,
    PubTitlePipe,
    SearchMemberComponent,
    NuxComponent
  ],
  exports: [
    PerfectScrollbarModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTableModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    SearchMemberComponent,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    ControlMessagesComponent,
    ArticleCardListComponent,
    ArticleSmallCardListComponent,
    AccountListComponent,
    FlexLayoutModule,
    PbqPipe,
    TimeIntervalPipe,
    ShortNamePipe,
    HttpsPipe,
    FloatPipe,
    SafeHtmlPipe,
    IdToUsernamePipe,
    ReportDialogComponent,
    LoginDialogComponent,
    NotificationDropdownComponent,
    DomChangeDirective,
    HrefToRouterLinkDirective,
    LazyLoadImagesModule,
    SettingsComponent,
    PubTitlePipe,
    NuxComponent
  ],
  providers: [DecimalPipe, DatePipe, Broadcaster],
  entryComponents: [ReportDialogComponent, LoginDialogComponent]
})
export class SharedModule {}
