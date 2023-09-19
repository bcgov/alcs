import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { ChangeSurveyPlanConfirmationDialogComponent } from './change-survey-plan-confirmation-dialog.component';

describe('ChangeSurveyPlanConfirmationDialogComponent', () => {
  let component: ChangeSurveyPlanConfirmationDialogComponent;
  let fixture: ComponentFixture<ChangeSurveyPlanConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeSurveyPlanConfirmationDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeSurveyPlanConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
