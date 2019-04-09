import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
import { AuthguardService } from '../core/services/authguard.service';
import { NotificationComponent } from './notification/notification.component';
import { SettingsComponent } from '../shared/settings/settings.component';
import { LoginPasswordComponent } from './login-password/login-password.component';
import { RegistrationPasswordComponent } from './registration-password/registration-password.component';

export const userRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        pathMatch: 'full',
        component: LoginComponent
      },
      {
        path: 'register',
        pathMatch: 'full',
        component: RegisterComponent
      },
      {
        path: 'recover',
        pathMatch: 'full',
        component: RecoverComponent
      },
      {
        path: 'settings',
        pathMatch: 'full',
        canActivate: [AuthguardService],
        component: SettingsComponent
      },
      {
        path: 'signin/confirmation/:code',
        data: {
          action: 'signin'
        },
        pathMatch: 'full',
        component: LoginPasswordComponent
      },
      {
        path: 'signup/confirmation/:code',
        data: {
          action: 'signup'
        },
        pathMatch: 'full',
        component: RegistrationPasswordComponent
      },
      {
        path: 'set-new-password/:code',
        pathMatch: 'full',
        component: RecoverComponent
      },
      {
        path: 'notifications',
        pathMatch: 'full',
        canActivate: [AuthguardService],
        component: NotificationComponent
      }
    ]
  }
];
