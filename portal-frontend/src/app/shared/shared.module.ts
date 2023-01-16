import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropDirective } from './file-drag-drop/drag-drop.directive';
import { FileDragDropComponent } from './file-drag-drop/file-drag-drop.component';
import { FileSizePipe } from './pipes/fileSize.pipe';
import { DATE_FORMATS } from './utils/date-format';

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule],
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
    MatButtonToggleModule,
    MatExpansionModule,
    MatStepperModule,
    FileDragDropComponent,
    FileSizePipe,
  ],
  declarations: [FileDragDropComponent, FileSizePipe, DragDropDirective],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [{ provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }],
    };
  }
}
