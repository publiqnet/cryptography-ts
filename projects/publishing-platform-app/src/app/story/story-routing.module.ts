import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { StoriesComponent } from './stories/stories.component';

export const storyRoutes: Routes = [
  {
    path: 't',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/'
      },
      {
        path: ':name',
        pathMatch: 'full',
        component: StoriesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(storyRoutes)],
  exports: [RouterModule]
})
export class StoriesRoutingModule {}
