import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { DatetimeAdapter, MtxNativeDatetimeModule } from '@ng-matero/extensions/core';
import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ApplicationDocumentComponent } from './application-document/application-document.component';
import { ApplicationTypePillComponent } from './application-type-pill/application-type-pill.component';
import { AvatarCircleComponent } from './avatar-circle/avatar-circle.component';
import { DetailsHeaderComponent } from './details-header/details-header.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { InlineBooleanComponent } from './inline-boolean/inline-boolean.component';
import { InlineDatepickerComponent } from './inline-datepicker/inline-datepicker.component';
import { InlineDropdownComponent } from './inline-dropdown/inline-dropdown.component';
import { InlineNumberComponent } from './inline-number/inline-number.component';
import { InlineReviewOutcomeComponent } from './inline-review-outcome/inline-review-outcome.component';
import { InlineTextComponent } from './inline-text/inline-text.component';
import { InlineTextareaComponent } from './inline-textarea/inline-textarea.component';
import { MeetingOverviewComponent } from './meeting-overview/meeting-overview.component';
import { NoDataComponent } from './no-data/no-data.component';
import { FileSizePipe } from './pipes/fileSize.pipe';
import { MomentPipe } from './pipes/moment.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { StartOfDayPipe } from './pipes/startOfDay.pipe';
import { StaffJournalNoteInputComponent } from './staff-journal/staff-journal-note-input/staff-journal-note-input.component';
import { StaffJournalNoteComponent } from './staff-journal/staff-journal-note/staff-journal-note.component';
import { StaffJournalComponent } from './staff-journal/staff-journal.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';
import { TimelineComponent } from './timeline/timeline.component';
import { DATE_FORMATS } from './utils/date-format';
import { ExtensionsDatepickerFormatter } from './utils/extensions-datepicker-formatter';
import { BooleanToStringPipe } from './pipes/boolean-to-string.pipe';

@NgModule({
  declarations: [
    FavoriteButtonComponent,
    AvatarCircleComponent,
    MomentPipe,
    StartOfDayPipe,
    MeetingOverviewComponent,
    InlineTextareaComponent,
    InlineBooleanComponent,
    InlineNumberComponent,
    InlineTextComponent,
    InlineDropdownComponent,
    DetailsHeaderComponent,
    ApplicationDocumentComponent,
    TimeTrackerComponent,
    ApplicationTypePillComponent,
    SafePipe,
    FileSizePipe,
    TimelineComponent,
    InlineDatepickerComponent,
    StaffJournalComponent,
    StaffJournalNoteComponent,
    StaffJournalNoteInputComponent,
    InlineReviewOutcomeComponent,
    BooleanToStringPipe,
    NoDataComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CdkDropList,
    CdkDrag,
    RouterModule,
    MatDatepickerModule,
    MatDialogModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgSelectModule,
    NgOptionHighlightModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatMenuModule,
    MatTableModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MomentPipe,
    MatExpansionModule,
    MtxButtonModule,
    StartOfDayPipe,
    MatTooltipModule,
    InlineTextareaComponent,
    InlineBooleanComponent,
    InlineNumberComponent,
    InlineTextComponent,
    InlineDropdownComponent,
    MatAutocompleteModule,
    MatButtonToggleModule,
    DetailsHeaderComponent,
    ApplicationDocumentComponent,
    MeetingOverviewComponent,
    FavoriteButtonComponent,
    AvatarCircleComponent,
    MatSelectModule,
    TimeTrackerComponent,
    ApplicationTypePillComponent,
    SafePipe,
    FileSizePipe,
    NgxMaskDirective,
    NgxMaskPipe,
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    MatCheckboxModule,
    MatSortModule,
    TimelineComponent,
    InlineDatepickerComponent,
    StaffJournalComponent,
    StaffJournalNoteComponent,
    StaffJournalNoteInputComponent,
    InlineReviewOutcomeComponent,
    BooleanToStringPipe,
    NoDataComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        { provide: DatetimeAdapter, useClass: ExtensionsDatepickerFormatter, deps: [MAT_DATE_LOCALE, DateAdapter] },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
      ],
    };
  }
}
