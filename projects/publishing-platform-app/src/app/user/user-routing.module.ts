import { Routes } from '@angular/router';

import { UserTemplateComponent } from './user-template/user-template.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';

export const userRoutes: Routes = [
  {
    path: 'user',
    component: UserTemplateComponent,
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
      }
    ]
  }
];
