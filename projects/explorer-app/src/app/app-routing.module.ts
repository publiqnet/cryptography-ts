import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { TemplateComponent } from './template/template.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: HomepageComponent
            },
            {   path: 'search/:term',
                pathMatch: 'full',
                component: SearchComponent
            },
            {   path: 'block',
                loadChildren: './block/block.module#BlockModule'
            },
            {
                path: 'not-found',
                pathMatch: 'full',
                component: ErrorPageComponent,
                data: {
                    message: 'Page not found!'
                }
            }
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
