import { Routes } from '@angular/router';

import { HelpComponent } from './help/help.component';

export const helpRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'help',
        component: HelpComponent
      }
    ]
  }
];
