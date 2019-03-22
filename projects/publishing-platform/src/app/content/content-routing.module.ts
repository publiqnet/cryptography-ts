import { Routes } from '@angular/router';

import { NewcontentComponent } from './newcontent/newcontent.component';
import { AuthguardService } from '../core/services/authguard.service';
import { MycontentComponent } from './mycontent/mycontent.component';
import { EditDraftComponent } from './edit-draft/edit-draft.component';
import { EditContentComponent } from './edit-content/edit-content.component';
import { NewPublicationComponent } from './new-publication/new-publication.component';
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
        component: MycontentComponent,
        canActivate: [AuthguardService]
      },
      {
        path: 'newpublication',
        component: NewPublicationComponent,
        canActivate: [AuthguardService]
      },
      {
        path: 'editpublication/:pub',
        component: NewPublicationComponent,
        canActivate: [AuthguardService]
      },
      {
        path: 'newcontent',
        component: NewcontentComponent,
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
