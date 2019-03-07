import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
import { SharedModule } from '../shared/shared.module';
import { RegisterConfirmationComponent } from './register-confirmation/register-confirmation.component';
import { NotificationComponent } from './notification/notification.component';
import { BrainKeyComponent } from './brain-key/brain-key.component';
import { userRoutes } from './user-routing.module';
import { NewPasswordComponent } from './new-password/new-password.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule.forChild(),
    RouterModule.forChild(userRoutes)
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    RecoverComponent,
    RegisterConfirmationComponent,
    NotificationComponent,
    BrainKeyComponent,
    NewPasswordComponent
  ]
})
export class UserModule {}
