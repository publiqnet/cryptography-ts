import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
// import { RegisterConfirmationComponent } from './register-confirmation/register-confirmation.component';
// import { BrainKeyComponent } from './brain-key/brain-key.component';
// import { RegisterGuardService } from '../guards/register-guard.service';
import { LoginCheckGuardService } from '../guards/check-login-guard.service';
import { RecoverPhraseComponent } from './recover-phrase/recover-phrase.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { RegistrationPasswordComponent } from './registration-password/registration-password.component';
import { LoginPasswordComponent } from './login-password/login-password.component';

export const userRoutes: Routes = [
    {
      path: 'user',
      children: [
        {
          path: '',
          pathMatch: 'full',
          redirectTo: '/page-not-found'
        },
        {
          path: 'login',
          pathMatch: 'full',
          component: LoginComponent,
          canActivate: [LoginCheckGuardService]
        },
        {
          path: 'register',
          pathMatch: 'full',
          component: RegisterComponent,
          canActivate: [LoginCheckGuardService]
        },
        {
          path: 'recover',
          pathMatch: 'full',
          component: RecoverComponent,
          canActivate: [LoginCheckGuardService]
        },
        {
          path: 'new-password',
          pathMatch: 'full',
          component: NewPasswordComponent,
          canActivate: [LoginCheckGuardService]
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
        // {
        //   path: 'confirmation/:code',
        //   pathMatch: 'full',
        //   component: RegisterConfirmationComponent,
        // },
        // {
        //     path: 'set-new-password/:code',
        //     pathMatch: 'full',
        //     component: RecoverComponent,
        //     canActivate: [LoginCheckGuardService]
        // },
        // {
        //   path: 'complete-registration',
        //   pathMatch: 'full',
        //   component: BrainKeyComponent
        //   // canActivate: [RegisterGuardService]
        // },
        {
          path: 'recover-phrase',
          pathMatch: 'full',
          component: RecoverPhraseComponent
        }
      ]
    }
  ]
;
