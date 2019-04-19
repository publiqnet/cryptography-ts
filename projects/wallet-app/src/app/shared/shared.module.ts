import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
    MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule,
    MatToolbarModule, MatCardModule, MatAutocompleteModule, MatButtonToggleModule, MatCheckboxModule, MatChipsModule,
    MatTableModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatGridListModule,
    MatInputModule, MatListModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule,
    MatRippleModule, MatSelectModule, MatSidenavModule, MatSlideToggleModule, MatSliderModule, MatSortModule,
    MatTabsModule, MatTooltipModule, MatNativeDateModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from './control-message/control-message.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PbqPipe } from './pipes/pbq.pipe';
import { environment } from '../../environments/environment';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ErrorService } from '../core/services/error.service';
import { FloatPipe } from './pipes/float.pipe';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedLibModule } from 'shared-lib';
import { HelperLibModule } from 'helper-lib';
import { UiLibModule } from 'ui-lib';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
    imports: [
        PerfectScrollbarModule,
        CommonModule,
        RouterModule,
        MatIconModule,
        MatCardModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatChipsModule,
        MatTableModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatSnackBarModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        FlexLayoutModule,
        SharedLibModule,
        HelperLibModule,
        UiLibModule,
        TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          },
          isolate: true
        })
    ],
    declarations: [
        ControlMessagesComponent,
        PageNotFoundComponent,
        PbqPipe,
        FloatPipe
    ],
    exports: [
        PerfectScrollbarModule,
        CommonModule,
        RouterModule,
        MatIconModule,
        MatCardModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatChipsModule,
        MatTableModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatSnackBarModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
        ControlMessagesComponent,
        FlexLayoutModule,
        SharedLibModule,
        HelperLibModule,
        UiLibModule,
        PbqPipe,
        FloatPipe
    ],
    providers: [
        DecimalPipe,
        ErrorService,
        {provide: 'oauthUrl', useValue: environment.oauth_backend},
    ]
})
export class SharedModule {
}
