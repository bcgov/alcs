import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgSelectModule } from '@ng-select/ng-select';
import { NoticeOfIntentDecisionService } from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';
import { StartOfDayPipe } from '../../../../shared/pipes/startOfDay.pipe';
import { DecisionDialogComponent } from './decision-dialog.component';

describe('DecisionDialogComponent', () => {
  let component: DecisionDialogComponent;
  let fixture: ComponentFixture<DecisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionDialogComponent, MomentPipe, StartOfDayPipe],
      providers: [
        {
          provide: NoticeOfIntentDecisionService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { meetingType: { code: 'fake', label: 'fake' }, outcomes: [] } },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [MatDialogModule, MatSnackBarModule, ReactiveFormsModule, NgSelectModule, MatButtonToggleModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
