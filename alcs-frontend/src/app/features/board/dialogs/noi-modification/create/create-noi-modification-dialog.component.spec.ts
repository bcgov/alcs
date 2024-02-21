import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { CreateNoiModificationDialogComponent } from './create-noi-modification-dialog.component';

describe('CreateNoiModificationDialogComponent', () => {
  let component: CreateNoiModificationDialogComponent;
  let fixture: ComponentFixture<CreateNoiModificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateNoiModificationDialogComponent],
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatDividerModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatAutocompleteModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateNoiModificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the form fields', () => {
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#applicant')).toBeTruthy();
    expect(compiled.querySelector('#fileNumber')).toBeTruthy();
  });
});
