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
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
import { ApplicationLegacyIdComponent } from './application-legacy-id/application-legacy-id.component';
import { ApplicationSubmissionStatusTypePillComponent } from './application-submission-status-type-pill/application-submission-status-type-pill.component';
import { ApplicationTypePillComponent } from './application-type-pill/application-type-pill.component';
import { AvatarCircleComponent } from './avatar-circle/avatar-circle.component';
import { DetailsHeaderComponent } from './details-header/details-header.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { InlineApplicantTypeComponent } from './inline-applicant-type/inline-applicant-type.component';
import { InlineBooleanComponent } from './inline-editors/inline-boolean/inline-boolean.component';
import { InlineButtonToggleComponent } from './inline-editors/inline-button-toggle/inline-button-toggle.component';
import { InlineChairReviewOutcomeComponent } from './inline-editors/inline-chair-review-outcome/inline-chair-review-outcome.component';
import { InlineDatepickerComponent } from './inline-editors/inline-datepicker/inline-datepicker.component';
import { InlineDropdownComponent } from './inline-editors/inline-dropdown/inline-dropdown.component';
import { InlineNgSelectComponent } from './inline-editors/inline-ng-select/inline-ng-select.component';
import { InlineNumberComponent } from './inline-editors/inline-number/inline-number.component';
import { InlineDecisionOutcomeComponent } from './inline-editors/inline-review-decision-outcome/inline-decision-outcome.component';
import { InlineReviewOutcomeComponent } from './inline-editors/inline-review-outcome/inline-review-outcome.component';
import { InlineTextComponent } from './inline-editors/inline-text/inline-text.component';
import { InlineTextareaEditComponent } from './inline-editors/inline-textarea-edit/inline-textarea-edit.component';
import { InlineTextareaComponent } from './inline-editors/inline-textarea/inline-textarea.component';
import { LotsTableFormComponent } from './lots-table/lots-table-form.component';
import { MeetingOverviewComponent } from './meeting-overview/meeting-overview.component';
import { NoDataComponent } from './no-data/no-data.component';
import { BooleanToStringPipe } from './pipes/boolean-to-string.pipe';
import { FileSizePipe } from './pipes/fileSize.pipe';
import { MomentPipe } from './pipes/moment.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { StartOfDayPipe } from './pipes/startOfDay.pipe';
import { TableColumnNoDataPipe } from './pipes/table-column-no-data.pipe';
import { StaffJournalNoteInputComponent } from './staff-journal/staff-journal-note-input/staff-journal-note-input.component';
import { StaffJournalNoteComponent } from './staff-journal/staff-journal-note/staff-journal-note.component';
import { StaffJournalComponent } from './staff-journal/staff-journal.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';
import { TimelineComponent } from './timeline/timeline.component';
import { DATE_FORMATS } from './utils/date-format';
import { ExtensionsDatepickerFormatter } from './utils/extensions-datepicker-formatter';
import { WarningBannerComponent } from './warning-banner/warning-banner.component';
import { DragDropDirective } from './drag-drop-file/drag-drop-file.directive';
import { TruncatePipe } from './pipes/truncate.pipe';
import { TagsHeaderComponent } from './tags/tags-header/tags-header.component';
import { MatChipsModule } from '@angular/material/chips';
import { TagChipComponent } from './tags/tag-chip/tag-chip.component';
import { DomSanitizer } from '@angular/platform-browser';
import { CommissionerTagsHeaderComponent } from './tags/commissioner-tags-header/commissioner-tags-header.component';
import { DocumentUploadDialogComponent } from './document-upload-dialog/document-upload-dialog.component';
import { FlagDialogComponent } from './flag-dialog/flag-dialog.component';
import { UnFlagDialogComponent } from './unflag-dialog/unflag-dialog.component';
import { DecisionConditionFinancialInstrumentComponent } from './decision-condition-financial-instrument/decision-condition-financial-instrument.component';
import { DecisionConditionFinancialInstrumentDialogComponent } from './decision-condition-financial-instrument/decision-condition-financial-instrument-dialog/decision-condition-financial-instrument-dialog.component';
import { DocumentFileLoader } from './document-file-loader/document-file-loader.component';

@NgModule({
  declarations: [
    FavoriteButtonComponent,
    AvatarCircleComponent,
    MomentPipe,
    StartOfDayPipe,
    MeetingOverviewComponent,
    InlineApplicantTypeComponent,
    InlineTextareaEditComponent,
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
    InlineDecisionOutcomeComponent,
    BooleanToStringPipe,
    NoDataComponent,
    ApplicationSubmissionStatusTypePillComponent,
    WarningBannerComponent,
    ErrorMessageComponent,
    LotsTableFormComponent,
    InlineNgSelectComponent,
    ApplicationLegacyIdComponent,
    TableColumnNoDataPipe,
    InlineChairReviewOutcomeComponent,
    InlineButtonToggleComponent,
    DragDropDirective,
    TruncatePipe,
    TagsHeaderComponent,
    TagChipComponent,
    CommissionerTagsHeaderComponent,
    DocumentUploadDialogComponent,
    FlagDialogComponent,
    UnFlagDialogComponent,
    DecisionConditionFinancialInstrumentComponent,
    DecisionConditionFinancialInstrumentDialogComponent,
    DocumentFileLoader,
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
    NgSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatRadioModule,
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
    InlineApplicantTypeComponent,
    InlineTextareaEditComponent,
    InlineTextareaComponent,
    InlineBooleanComponent,
    InlineNumberComponent,
    InlineTextComponent,
    InlineDropdownComponent,
    InlineNgSelectComponent,
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
    InlineDecisionOutcomeComponent,
    BooleanToStringPipe,
    NoDataComponent,
    ApplicationSubmissionStatusTypePillComponent,
    WarningBannerComponent,
    ErrorMessageComponent,
    LotsTableFormComponent,
    ApplicationLegacyIdComponent,
    TableColumnNoDataPipe,
    InlineChairReviewOutcomeComponent,
    MatSlideToggleModule,
    InlineButtonToggleComponent,
    DragDropDirective,
    TruncatePipe,
    TagsHeaderComponent,
    TagChipComponent,
    DocumentUploadDialogComponent,
    FlagDialogComponent,
    UnFlagDialogComponent,
    DecisionConditionFinancialInstrumentComponent,
    DecisionConditionFinancialInstrumentDialogComponent,
  ],
})
export class SharedModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIcon(
      'cancel_filled',
      domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/cancel_filled.svg'),
    );
    matIconRegistry.addSvgIcon(
      'personal_places',
      domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/personal_places.svg'),
    );
  }
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
