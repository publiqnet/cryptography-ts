import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { transactionRoutes } from './transaction/transaction-routing.module';

import { HomepageComponent } from './homepage/homepage.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { TemplateComponent } from './template/template.component';
import { SearchComponent } from './search/search.component';
import { BlockComponent } from './block/block.component';
import { accountRoutes } from './account/account-routing.module';

export const routes: Routes = [
  {
    path: '',
    component: TemplateComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HomepageComponent
      },
      {
        path: 'search/:term',
        pathMatch: 'full',
        component: SearchComponent
      },
      {
        path: 'b/:hash',
        pathMatch: 'full',
        component: BlockComponent
      },
      {
        path: 'block-navigation',
        loadChildren: () => import('./block-navigation/block-navigation.module').then(m => m.BlockNavigationModule)
      },
      {
        path: 'not-found',
        pathMatch: 'full',
        component: ErrorPageComponent,
        data: {
          message: 'Page not found!'
        }
      },
      ...transactionRoutes,
      ...accountRoutes
    ]
  },
  {path: '**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled'})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
