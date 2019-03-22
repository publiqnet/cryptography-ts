import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PublicationComponent } from './publication/publication.component';
import { PublicationRoutingModule } from './publication-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MyPublicationComponent } from './my-publication/my-publication.component';
import { MyPublicationsComponent } from '../content/my-publications/my-publications.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PublicationRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [
    PublicationComponent,
    MyPublicationComponent,
    MyPublicationsComponent
  ]
})
export class PublicationModule {}
