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
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ErrorService } from '../core/services/error.service';
import { FloatPipe } from './pipes/float.pipe';

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
        ReactiveFormsModule,
        FlexLayoutModule
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
        PbqPipe,
        FloatPipe
    ],
    providers: [
        DecimalPipe,
        ErrorService
    ]
})
export class SharedModule {
}