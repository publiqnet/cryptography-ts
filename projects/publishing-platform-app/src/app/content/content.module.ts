import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// import { SwiperModule } from 'angular2-useful-swiper';
import { TranslateModule } from '@ngx-translate/core';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import { MycontentComponent } from './mycontent/mycontent.component';
import { NewcontentOldComponent } from './newcontent-old/newcontent-old.component';
import { SharedModule } from '../shared/shared.module';
import { EditDraftComponent } from './edit-draft/edit-draft.component';
import { EditContentComponent } from './edit-content/edit-content.component';
import { contentRoutes } from './content-routing.module';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { NewcontentComponent } from './newcontent/newcontent.component';


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
    MycontentComponent,
    NewcontentOldComponent,
    NewcontentComponent,
    EditDraftComponent,
    EditContentComponent
  ]
})
export class ContentModule {}
