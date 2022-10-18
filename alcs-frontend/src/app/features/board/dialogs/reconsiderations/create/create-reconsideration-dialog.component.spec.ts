import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateReconsiderationDialogComponent } from './create-reconsideration-dialog.component';

describe('CreateReconsiderationDialogComponent', () => {
  let component: CreateReconsiderationDialogComponent;
  let fixture: ComponentFixture<CreateReconsiderationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateReconsiderationDialogComponent],
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReconsiderationDialogComponent);
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
    expect(compiled.querySelector('.card-type')).toBeTruthy();
  });
});
