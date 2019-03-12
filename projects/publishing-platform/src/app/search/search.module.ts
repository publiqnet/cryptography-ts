import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { SearchAccountComponent } from './search-account/search-account.component';
import { SearchContentComponent } from './search-content/search-content.component';
import { SearchPublicationComponent } from './search-publication/search-publication.component';
import { searchRoutes } from './search-routhing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule.forChild(),
    RouterModule.forChild(searchRoutes)
  ],
  declarations: [SearchAccountComponent, SearchContentComponent, SearchPublicationComponent],
  providers: []
})
export class SearchModule {}