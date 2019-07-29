import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import { NewcontentOldComponent } from './newcontent-old/newcontent-old.component';
import { SharedModule } from '../shared/shared.module';
import { EditDraftComponent } from './edit-draft/edit-draft.component';
import { EditContentComponent } from './edit-content/edit-content.component';
import { contentRoutes } from './content-routing.module';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { NewContentComponent } from './newcontent/newcontent.component';
import { MyContentComponent } from './mycontent/mycontent.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FroalaEditorModule,
    FroalaViewModule,
    // SwiperModule,
    TranslateModule.forChild(),
    RouterModule.forChild(contentRoutes),
    NgxUsefulSwiperModule
  ],
  declarations: [
    NewContentComponent,
    NewcontentOldComponent,
    MyContentComponent,
    EditDraftComponent,
    EditContentComponent
  ]
})
export class ContentModule {}
