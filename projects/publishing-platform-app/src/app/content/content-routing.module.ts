import { Routes } from '@angular/router';

import { NewContentComponent } from './newcontent/newcontent.component';
import { AuthguardService } from '../core/services/authguard.service';
import { MyContentComponent } from './mycontent/mycontent.component';
import { EditDraftComponent } from './edit-draft/edit-draft.component';
import { EditContentComponent } from './edit-content/edit-content.component';
import { PendingChangesGuard } from '../guards/pending-changes-guard.service';

export const contentRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'mycontent'
      },
      {
        path: 'mycontent',
        component: MyContentComponent,
        canActivate: [AuthguardService]
      },
      {
        path: 'newcontent',
        component: NewContentComponent,
        canActivate: [AuthguardService]
      },
      {
        path: 'editdraft/:id',
        component: EditDraftComponent,
        canActivate: [AuthguardService]
      },
      {
        path: 'edit/:id',
        component: EditContentComponent,
        canActivate: [AuthguardService],
        canDeactivate: [PendingChangesGuard]
      }
    ]
  }
];
