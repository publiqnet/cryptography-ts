import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PublicationComponent } from './publication/publication.component';
import { PublicationRoutingModule } from './publication-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ManagePublicationComponent } from './manage/manage-publication.component';
import { MyPublicationsComponent } from './my-publications/my-publications.component';
import { NewPublicationComponent } from './new/new-publication.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PublicationRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [
    PublicationComponent,
    ManagePublicationComponent,
    MyPublicationsComponent,
    NewPublicationComponent
  ]
})
export class PublicationModule {}
