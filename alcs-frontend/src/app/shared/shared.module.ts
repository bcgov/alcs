import { Platform } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@matheo/datepicker';
import { DateAdapter as MatheoDateAdapter, MatNativeDateModule } from '@matheo/datepicker/core';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { DatetimeAdapter } from '@ng-matero/extensions/core';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { AvatarCircleComponent } from './avatar-circle/avatar-circle.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { MeetingOverviewComponent } from './meeting-overview/meeting-overview.component';
import { MomentPipe } from './pipes/moment.pipe';
import { StartOfDayPipe } from './pipes/startOfDay.pipe';
import { DATE_FORMATS } from './utils/date-format';
import { ExtensionsDatepickerFormatter } from './utils/extensions-datepicker-formatter';
import { MatheoDatepickerFormatter } from './utils/matheo-datepicker-formatter';

@NgModule({
  declarations: [
    FavoriteButtonComponent,
    AvatarCircleComponent,
    MomentPipe,
    StartOfDayPipe,
    MeetingOverviewComponent,
    InlineEditComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatTooltipModule,
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
    FavoriteButtonComponent,
    AvatarCircleComponent,
    MatTableModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MomentPipe,
    MeetingOverviewComponent,
    MatExpansionModule,
    MtxButtonModule,
    StartOfDayPipe,
    MatTooltipModule,
    InlineEditComponent,
    MatAutocompleteModule,
    MatButtonToggleModule,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        { provide: MatheoDateAdapter, useClass: MatheoDatepickerFormatter, deps: [MAT_DATE_LOCALE, Platform] },
        { provide: DatetimeAdapter, useClass: ExtensionsDatepickerFormatter, deps: [MAT_DATE_LOCALE, DateAdapter] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
      ],
    };
  }
}
