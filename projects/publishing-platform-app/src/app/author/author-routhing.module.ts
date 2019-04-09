import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthorComponent } from './author/author.component';

const routes: Routes = [
  {
    path: 'a',
    component: AuthorComponent,
    children: [
      {
        path: ':id',
        pathMatch: 'full',
        redirectTo: `a`
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorRoutingModule {}
