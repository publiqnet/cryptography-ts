import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from './homepage/homepage.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { AuthguardService } from './services/authguard.service';
import { NotificationService } from './services/notification.service';
import { SharedModule } from '../shared/shared.module';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RegisterGuardService } from '../guards/register-guard.service';
import { LoginCheckGuardService } from '../guards/check-login-guard.service';
import { UserModule } from '../user/user.module';
import { TemplateComponent } from './template/template.component';
import { DialogService } from './services/dialog.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CryptService } from './services/crypt.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        PerfectScrollbarModule,
        UserModule,
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
        HomepageComponent,
        HeaderComponent,
        FooterComponent,
        TemplateComponent,
        ConfirmDialogComponent
    ],
    providers: [
        AuthguardService,
        RegisterGuardService,
        LoginCheckGuardService,
        CryptService,
        NotificationService,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
        DialogService
    ],
    exports: [
        SharedModule
    ],
    entryComponents: [ConfirmDialogComponent],

})
export class CoreModule {
}
