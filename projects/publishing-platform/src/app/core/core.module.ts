import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { HomepageComponent } from './homepage/homepage.component';
import { SafePipe } from './pipes/safe.pipe';
import { SafeHtmlPipe } from './pipes/safeHtml.pipe';
import { ArticleComponent } from './article/article.component';
import { TemplateComponent } from './template/template.component';
import { HeaderComponent } from './header/header.component';
import { HeaderToolbarComponent } from './header-toolbar/header-toolbar.component';
import { FooterComponent } from './footer/footer.component';
import { AuthguardService } from './services/authguard.service';
import { AccountService } from './services/account.service';
import { NotificationService } from './services/notification.service';
import { SharedModule } from '../shared/shared.module';
import { ArticleService } from './services/article.service';
import { TagListComponent } from './tag-list/tag-list.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AutocompleteSearchComponent } from './autocomplete-search/autocomplete-search.component';
import { UserNotificationService } from './services/user-notification.service';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { RegisterGuardService } from '../guards/register-guard.service';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { NewstorySubmissionComponent } from './newstory-submission/newstory-submission.component';
import { DialogService } from './services/dialog.service';
import { SeoService } from './services/seo.service';
import { WalletService } from './services/wallet.service';
import { TagService } from './services/tag.service';
import { ChannelService } from './services/channel.service';
import { PendingChangesGuard } from '../guards/pending-changes-guard.service';
import { ErrorService } from './services/error.service';
import { SecurityDialogComponent } from './security-dialog/security-dialog.component';
import { AdaptiveDialogComponent } from './adaptive-dialog/adaptive-dialog.component';
import { NuxService } from './services/nux.service';
import { CoverEditDialogComponent } from './cover-edit-dialog/cover-edit-dialog.component';
import { ImageCropperModule } from 'ngx-img-cropper';
import { InputPasswordDialogComponent } from './input-password-dialog/input-password-dialog.component';
import { LinkService } from './services/link.service';
import { NewstorySubmission2Component } from './newstory-submission2/newstory-submission2.component';
import { HttpRpcService } from './services/httpRpc.service';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/home/', '.json');
}

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            isolate: true
        }),
        InfiniteScrollModule
    ],
    declarations: [
        HomepageComponent,
        SafePipe,
        ArticleComponent,
        TemplateComponent,
        HeaderComponent,
        HeaderToolbarComponent,
        FooterComponent,
        TagListComponent,
        ConfirmDialogComponent,
        AutocompleteSearchComponent,
        ClickOutsideDirective,
        InfoDialogComponent,
        AdaptiveDialogComponent,
        SecurityDialogComponent,
        CoverEditDialogComponent,
        InputPasswordDialogComponent,
        NewstorySubmissionComponent,
        NewstorySubmission2Component
    ],
    providers: [
        AuthguardService,
        PendingChangesGuard,
        AccountService,
        RegisterGuardService,
        NotificationService,
        ArticleService,
        TagService,
        ErrorService,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
        UserNotificationService,
        DialogService,
        SeoService,
        WalletService,
        HttpRpcService,
        NuxService,
        ChannelService,
        LinkService
    ],
    exports: [SafePipe, SharedModule],
    entryComponents: [
      NewstorySubmissionComponent,
      NewstorySubmission2Component,
        InputPasswordDialogComponent,
        ConfirmDialogComponent,
        InfoDialogComponent,
        AdaptiveDialogComponent,
        SecurityDialogComponent,
        CoverEditDialogComponent
    ]
})
export class CoreModule {
}
