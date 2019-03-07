import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
import { AuthguardService } from '../core/services/authguard.service';
import { RegisterConfirmationComponent } from './register-confirmation/register-confirmation.component';
import { NotificationComponent } from './notification/notification.component';
import { BrainKeyComponent } from './brain-key/brain-key.component';
import { RegisterGuardService } from '../guards/register-guard.service';
import { SettingsComponent } from '../shared/settings/settings.component';
import { NewPasswordComponent } from './new-password/new-password.component';

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
        path: 'confirmation/:code',
        pathMatch: 'full',
        component: RegisterConfirmationComponent
      },
      {
        path: 'set-new-password/:code',
        pathMatch: 'full',
        component: RecoverComponent
      },
      // {
      //   path: 'new-password',
      //   pathMatch: 'full',
      //   component: NewPasswordComponent,
      // },
      {
        path: 'notifications',
        pathMatch: 'full',
        canActivate: [AuthguardService],
        component: NotificationComponent
      },
      {
        path: 'complete-registration',
        pathMatch: 'full',
        component: BrainKeyComponent,
        canActivate: [RegisterGuardService]
      }
    ]
  }
];
