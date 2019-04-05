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


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        PerfectScrollbarModule,
        UserModule
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
