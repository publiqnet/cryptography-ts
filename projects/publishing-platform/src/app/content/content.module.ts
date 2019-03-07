import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SwiperModule } from 'angular2-useful-swiper';
import { TranslateModule } from '@ngx-translate/core';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import { MycontentComponent } from './mycontent/mycontent.component';
import { NewcontentComponent } from './newcontent/newcontent.component';
import { SharedModule } from '../shared/shared.module';
import { EditDraftComponent } from './edit-draft/edit-draft.component';
import { EditContentComponent } from './edit-content/edit-content.component';
import { MyPublicationsComponent } from './my-publications/my-publications.component';
import { NewPublicationComponent } from './new-publication/new-publication.component';
import { contentRoutes } from './content-routing.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FroalaEditorModule,
    FroalaViewModule,
    SwiperModule,
    TranslateModule.forChild(),
    RouterModule.forChild(contentRoutes),
  ],
  declarations: [
    MycontentComponent,
    NewcontentComponent,
    EditDraftComponent,
    EditContentComponent,
    MyPublicationsComponent,
    NewPublicationComponent
  ]
})
export class ContentModule {}
