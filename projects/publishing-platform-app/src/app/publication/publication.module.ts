import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PublicationComponent } from './publication/publication.component';
import { PublicationRoutingModule } from './publication-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ManagePublicationComponent } from './manage/manage-publication.component';
import { MyPublicationsComponent } from './my-publications/my-publications.component';
import { NewPublicationComponent } from './new-old/new-publication.component';
import { NgxMasonryModule } from 'ngx-masonry';
import { PublicationOldComponent } from './publication-old/publication-old.component';
import { MyPublicationsOldComponent } from './my-publications-old/my-publications-old.component';
import { PublicationModalComponent } from './publication-modal/publication-modal.component';


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
    MyPublicationsOldComponent,
    MyPublicationsComponent,
    NewPublicationComponent,
    PublicationModalComponent,
  ]
})
export class PublicationModule {
}
