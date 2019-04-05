import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateComponent } from './core/template/template.component';
import { userRoutes } from './user/user-routing.module';
import { walletRoutes } from './wallet/wallet-routing.module';

import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'user/register'
            },
            ...userRoutes,
            ...walletRoutes
        ]
    },
    {
        path: 'page-not-found',
        pathMatch: 'full',
        component: PageNotFoundComponent
    },
    {
        path: '**',
        redirectTo: '/page-not-found'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {initialNavigation: 'enabled'})
    ],
    exports: [
        RouterModule
    ],
    declarations: [],
})
export class AppRoutingModule {
}
