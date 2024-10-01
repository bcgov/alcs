import { OverlayModule } from '@angular/cdk/overlay';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FileTypeFilterDropDownComponent } from '../features/public/search/file-type-filter-drop-down/file-type-filter-drop-down.component';
import { CustomStepperComponent } from './custom-stepper/custom-stepper.component';
import { DragDropDirective } from './file-drag-drop/drag-drop.directive';
import { FileDragDropComponent } from './file-drag-drop/file-drag-drop.component';
import { InfoBannerComponent } from './info-banner/info-banner.component';
import { NoDataComponent } from './no-data/no-data.component';
import { FileOverlaySpinnerComponent } from './overlay-spinner/file-overlay-spinner/file-overlay-spinner.component';
import { CrownOwnerDialogComponent } from './owner-dialogs/crown-owner-dialog/crown-owner-dialog.component';
import { OwnerDialogComponent } from './owner-dialogs/owner-dialog/owner-dialog.component';
import { ParcelOwnersComponent } from './owner-dialogs/parcel-owners/parcel-owners.component';
import { EmailValidPipe } from './pipes/emailValid.pipe';
import { FileSizePipe } from './pipes/fileSize.pipe';
import { MomentPipe } from './pipes/moment.pipe';
import { PhoneValidPipe } from './pipes/phoneValid.pipe';
import { TableColumnNoDataPipe } from './pipes/table-column-no-data.pipe';
import { PrescribedBodyComponent } from './prescribed-body/prescribed-body.component';
import { SoilTableComponent } from './soil-table/soil-table.component';
import { DATE_FORMATS } from './utils/date-format';
import { ValidationErrorComponent } from './validation-error/validation-error.component';
import { WarningBannerComponent } from './warning-banner/warning-banner.component';
import { CommissionPurposesPanelComponent } from './commission-purposes-panel/commission-purposes-panel.component';
import { MatCardModule } from '@angular/material/card';
import { OptionalAttachmentsMobileCardComponent } from './optional-attachments-mobile-card/optional-attachments-mobile-card.component';
import { OtherAttachmentMobileCardComponent } from './other-attachment-mobile-card/other-attachment-mobile-card.component';
import { ParcelOwnerMobileCardComponent } from './mobile/parcel-owner-mobile-card/parcel-owner-mobile-card.component';
import { TransfereeMobileCardComponent } from './mobile/transferee-mobile-card/transferee-mobile-card.component';
import { NaruResidenceMobileCardComponent } from './mobile/naru-residence-mobile-card/naru-residence-mobile-card.component';

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    CdkStepperModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatRadioModule,
    MatDialogModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatCardModule,
    MatMenuModule,
  ],
  declarations: [
    FileDragDropComponent,
    FileSizePipe,
    EmailValidPipe,
    PhoneValidPipe,
    DragDropDirective,
    WarningBannerComponent,
    InfoBannerComponent,
    NoDataComponent,
    ValidationErrorComponent,
    CustomStepperComponent,
    MomentPipe,
    PrescribedBodyComponent,
    OwnerDialogComponent,
    CrownOwnerDialogComponent,
    ParcelOwnersComponent,
    SoilTableComponent,
    TableColumnNoDataPipe,
    FileTypeFilterDropDownComponent,
    FileOverlaySpinnerComponent,
    CommissionPurposesPanelComponent,
    OptionalAttachmentsMobileCardComponent,
    OtherAttachmentMobileCardComponent,
    ParcelOwnerMobileCardComponent,
    TransfereeMobileCardComponent,
    NaruResidenceMobileCardComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRadioModule,
    MatTabsModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatStepperModule,
    FileDragDropComponent,
    FileSizePipe,
    EmailValidPipe,
    PhoneValidPipe,
    WarningBannerComponent,
    InfoBannerComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSelectModule,
    NoDataComponent,
    ValidationErrorComponent,
    OverlayModule,
    CustomStepperComponent,
    CdkStepperModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MomentPipe,
    PrescribedBodyComponent,
    OwnerDialogComponent,
    CrownOwnerDialogComponent,
    ParcelOwnersComponent,
    SoilTableComponent,
    TableColumnNoDataPipe,
    FileTypeFilterDropDownComponent,
    CommissionPurposesPanelComponent,
    OptionalAttachmentsMobileCardComponent,
    OtherAttachmentMobileCardComponent,
    ParcelOwnerMobileCardComponent,
    TransfereeMobileCardComponent,
    NaruResidenceMobileCardComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
