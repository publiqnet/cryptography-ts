import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicationComponent } from './publication/publication.component';

const routes: Routes = [
  {
    path: 'publication',
    component: PublicationComponent,
    children: [
      {
        path: ':slug',
        pathMatch: 'full',
        redirectTo: `publication`
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicationRoutingModule {}
