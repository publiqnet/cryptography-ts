import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PublicationComponent } from './publication/publication.component';
import { PublicationRoutingModule } from './publication-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ManagePublicationComponent } from './manage/manage-publication.component';
import { MyPublicationsComponent } from './my-publications/my-publications.component';
import { NewPublicationComponent } from './new/new-publication.component';
import { NgxMasonryModule } from 'ngx-masonry';
import { PublicationOldComponent } from './publication-old/publication-old.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PublicationRoutingModule,
    TranslateModule.forChild(),
    NgxMasonryModule
  ],
  declarations: [
    PublicationComponent,
    PublicationOldComponent,
    ManagePublicationComponent,
    MyPublicationsComponent,
    NewPublicationComponent
  ]
})
export class PublicationModule {
}
