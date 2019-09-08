import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { SafePipe } from '../core/pipes/safe.pipe';
import { SafeStylePipe } from '../core/pipes/safeStyle.pipe';
import { DomChangeDirective } from '../core/dom-change.directive';
import { HttpsPipe } from '../core/pipes/https.pipe';
import { ShortNamePipe } from '../core/pipes/shortname.pipe';
import { SettingsComponent } from './settings/settings.component';
import { SafeHtmlPipe } from '../core/pipes/safeHtml.pipe';
import { HrefToRouterLinkDirective } from '../core/directives/href-to-routerlink.directive';
import { PubTitlePipe } from '../core/pipes/pub-title.pipe';
import { SearchMemberComponent } from '../publication/search-member/search-member.component';
import { NuxComponent } from './nux/nux.component';
import { environment } from '../../environments/environment';
import { HelperLibModule, HttpHelperService } from 'helper-lib';
import { SharedLibModule } from 'shared-lib';
import { UiLibModule } from 'ui-lib';
import { ConfirmModalComponent } from '../core/confirm-modal/confirm-modal.component';
import { ChipsInputComponent } from './chips-input/chips-input.component';
import { BoostModalComponent } from '../core/boost-modal/boost-modal.component';

HttpHelperService.setBaseHeaders([
  {
    headerKay: 'X-API-TOKEN',
    getHeaderValue: () => localStorage.getItem('auth')
  }
]);

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
    SharedLibModule,
    HelperLibModule,
    UiLibModule,
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
    SafePipe,
    SafeStylePipe,
    SafeHtmlPipe,
    ReportDialogComponent,
    LoginDialogComponent,
    NotificationDropdownComponent,
    DomChangeDirective,
    HrefToRouterLinkDirective,
    PubTitlePipe,
    SearchMemberComponent,
    NuxComponent,
    ConfirmModalComponent,
    BoostModalComponent,
    ChipsInputComponent
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
    SharedLibModule,
    HelperLibModule,
    UiLibModule,
    PbqPipe,
    TimeIntervalPipe,
    ShortNamePipe,
    HttpsPipe,
    FloatPipe,
    SafePipe,
    SafeStylePipe,
    SafeHtmlPipe,
    ReportDialogComponent,
    LoginDialogComponent,
    NotificationDropdownComponent,
    DomChangeDirective,
    HrefToRouterLinkDirective,
    LazyLoadImagesModule,
    SettingsComponent,
    PubTitlePipe,
    NuxComponent,
    ConfirmModalComponent,
    BoostModalComponent,
    ChipsInputComponent
  ],
  providers: [
    DecimalPipe,
    DatePipe,
    Broadcaster,
    { provide: 'oauthUrl', useValue: environment.oauth_backend }
  ],
  entryComponents: [ReportDialogComponent, LoginDialogComponent]
})
export class SharedModule {}
