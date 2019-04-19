import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material';
import { CommonModule } from '@angular/common';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../services/api.service';
import { BlockResolver } from './block.resolver';
import { OperationNamePipe } from '../shared/pipes/operation-name/operation-name.pipe';


import { BlockNavigationComponent } from './block-navigation/block-navigation.component';
import { BlockComponent } from '../block/block.component';
import { ErrorPageComponent } from '../shared/error-page/error-page.component';

@NgModule({
    declarations: [
        BlockNavigationComponent
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
                    path: 'date/:date',
                    pathMatch: 'full',
                    component: BlockNavigationComponent
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
export class BlockNavigationModule {

}
