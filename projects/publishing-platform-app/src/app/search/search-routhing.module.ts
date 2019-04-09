import { Routes } from '@angular/router';

import { SearchAccountComponent } from './search-account/search-account.component';
import { SearchContentComponent } from './search-content/search-content.component';
import { SearchPublicationComponent } from './search-publication/search-publication.component';

export const searchRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/'
            },
            {
                path: 'account',
                pathMatch: 'full',
                redirectTo: '/'
            },
            {
                path: 'account/:term',
                pathMatch: 'full',
                component: SearchAccountComponent
            },
            {
                path: 'content',
                pathMatch: 'full',
                redirectTo: '/'
            },
            {
                path: 'content/:term',
                pathMatch: 'full',
                component: SearchContentComponent
            },
            {
                path: 'publication',
                pathMatch: 'full',
                redirectTo: '/'
            },
            {
                path: 'publication/:term',
                pathMatch: 'full',
                component: SearchPublicationComponent
            }
        ]
    }
];
