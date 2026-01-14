import { provideHttpClientTesting } from '@angular/common/http/testing';
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
import { createMock } from '@golevelup/ts-jest';
import { CreatePlanningReferralDialogComponent } from './create-planning-referral-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CreatePlanningReviewDialogComponent', () => {
  let component: CreatePlanningReferralDialogComponent;
  let fixture: ComponentFixture<CreatePlanningReferralDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CreatePlanningReferralDialogComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatDialogModule,
        MatFormFieldModule,
        MatDividerModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatAutocompleteModule],
    providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(CreatePlanningReferralDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
