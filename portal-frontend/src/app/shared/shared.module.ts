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
import { provideNgxMask } from 'ngx-mask';
import { CustomStepperComponent } from './custom-stepper/custom-stepper.component';
import { DragDropDirective } from './file-drag-drop/drag-drop.directive';
import { FileDragDropComponent } from './file-drag-drop/file-drag-drop.component';
import { NoDataComponent } from './no-data/no-data.component';
import { FileSizePipe } from './pipes/fileSize.pipe';
import { DATE_FORMATS } from './utils/date-format';
import { ValidationErrorComponent } from './validation-error/validation-error.component';
import { WarningBannerComponent } from './warning-banner/warning-banner.component';

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    provideNgxMask(),
  ],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatAutocompleteModule, CdkStepperModule],
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
    WarningBannerComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSelectModule,
    NoDataComponent,
    ValidationErrorComponent,
    OverlayModule,
    CustomStepperComponent,
    CdkStepperModule,
  ],
  declarations: [
    FileDragDropComponent,
    FileSizePipe,
    DragDropDirective,
    WarningBannerComponent,
    NoDataComponent,
    ValidationErrorComponent,
    CustomStepperComponent,
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
