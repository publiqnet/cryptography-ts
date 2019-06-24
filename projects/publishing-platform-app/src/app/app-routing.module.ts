import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { storyRoutes } from './story/story-routing.module';
import { HomepageComponent } from './core/homepage/homepage.component';
import { TemplateComponent } from './core/template/template.component';
import { ArticleComponent } from './core/article/article.component';
import { AuthorComponent } from './author/author/author.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { LanguageGuard } from './guards/language.guard';

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
            {
                path: 's/:uri',
                pathMatch: 'full',
                component: ArticleComponent
            },
            {
                path: 'article/:id',
                redirectTo: '/s/:id'
            },
            {
                path: 'a/:id',
                pathMatch: 'full',
                component: AuthorComponent
            },
            {
                path: 'p',
                loadChildren: './publication/publication.module#PublicationModule'
            },
            {
                path: 'content',
                loadChildren: './content/content.module#ContentModule'
            },
            {
                path: 'wallet',
                loadChildren: './wallet/wallet.module#WalletModule'
            },
            {
                path: 'search',
                loadChildren: './search/search.module#SearchModule'
            },
            {
                path: 'user',
                loadChildren: './user/user.module#UserModule'
            },
            ...storyRoutes
        ]
    },
    {
        path: 'page-not-found',
        pathMatch: 'full',
        component: PageNotFoundComponent
    },
    {
        path: ':lang',
        component: TemplateComponent,
        canActivateChild: [LanguageGuard],
        children: [
            {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/page-not-found'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {initialNavigation: 'enabled'})],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule {
}
