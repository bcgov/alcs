import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StartOfDayPipe } from '../../../../shared/pipes/startOfDay.pipe';

import { InfoRequestDialogComponent } from './info-request-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfoRequestDialogComponent', () => {
  let component: InfoRequestDialogComponent;
  let fixture: ComponentFixture<InfoRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfoRequestDialogComponent, StartOfDayPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [ReactiveFormsModule, FormsModule, MatSnackBarModule],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {},
        },
        {
            provide: MAT_DIALOG_DATA,
            useValue: {},
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(InfoRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
