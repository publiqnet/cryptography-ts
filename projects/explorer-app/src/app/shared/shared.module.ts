import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockListComponent } from './block-list/block-list.component';
import { SortPipe } from './pipes/order/orderby.pipe';
import { RouterModule } from '@angular/router';
import { OperationNamePipe } from './pipes/operation-name/operation-name.pipe';
import { PbqPipe } from './pipes/pbq/pbq.pipe';
import { ErrorPageComponent } from './error-page/error-page.component';
import { SafeHtmlPipe } from './pipes/safe-html/safeHtml.pipe';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [
        BlockListComponent,
        ErrorPageComponent,
        SortPipe,
        OperationNamePipe,
        PbqPipe,
        SafeHtmlPipe
    ],
    exports: [
        BlockListComponent,
        ErrorPageComponent,

        // pipes
        SortPipe,
        OperationNamePipe,
        PbqPipe,
        SafeHtmlPipe
    ]
})
export class SharedModule {
}