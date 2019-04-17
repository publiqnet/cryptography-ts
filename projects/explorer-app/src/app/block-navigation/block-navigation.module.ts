import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
