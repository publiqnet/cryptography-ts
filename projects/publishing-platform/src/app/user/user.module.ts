import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
import { SharedModule } from '../shared/shared.module';
import { NotificationComponent } from './notification/notification.component';
import { userRoutes } from './user-routing.module';
import { NewPasswordComponent } from './new-password/new-password.component';
import { LoginPasswordComponent } from './login-password/login-password.component';
import { RegistrationPasswordComponent } from './registration-password/registration-password.component';


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
    LoginPasswordComponent,
    RegistrationPasswordComponent,
    NotificationComponent,
    NewPasswordComponent
  ]
})
export class UserModule {}
