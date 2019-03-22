import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicationComponent } from './publication/publication.component';
import { MyPublicationsComponent } from '../content/my-publications/my-publications.component';
import { AuthguardService } from '../core/services/authguard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'my-publications',
        component: MyPublicationsComponent,
        canActivate: [AuthguardService]
      },
      {
        path: ':slug',
        pathMatch: 'full',
        component: PublicationComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicationRoutingModule {}
