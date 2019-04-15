///<reference path="../shared/error-page/error-page.component.ts"/>
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BlockComponent } from './block/block.component';
import { JsonViewerComponent } from './json-viewer/json-viewer.component';
import { AccountComponent } from './account/account.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BlockNavigationComponent } from './block-navigation/block-navigation.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { OperationNamePipe } from '../shared/pipes/operation-name/operation-name.pipe';
import { SharedModule } from '../shared/shared.module';
import { BlockResolver } from './block.resolver';
import { ErrorPageComponent } from '../shared/error-page/error-page.component';
import { MatProgressSpinnerModule } from '@angular/material';

@NgModule({
    declarations: [
        BlockComponent,
        JsonViewerComponent,
        BlockNavigationComponent,
        AccountComponent,
    ],
    imports: [
        CommonModule,
        InfiniteScrollModule,
        MatProgressSpinnerModule,
        SharedModule,
        RouterModule.forChild([
                {
                    path: 'not-exists',
                    component: ErrorPageComponent,
                    data: {message: 'Block not found!'}
                },
                {
                    path: ':id',
                    pathMatch: 'full',
                    component: BlockComponent,
                    resolve: {
                        block: BlockResolver
                    }
                },
                {
                    path: 'date/:date',
                    pathMatch: 'full',
                    component: BlockNavigationComponent
                },
                {
                    path: 'account/:id',
                    pathMatch: 'full',
                    component: AccountComponent
                }
            ],
        )
    ],
    providers: [
        ApiService,
        BlockResolver,
        OperationNamePipe
    ]
})
export class BlockModule {

}
