import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionService } from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentModificationDto } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';
import { StartOfDayPipe } from '../../../../shared/pipes/startOfDay.pipe';
import { DecisionDialogComponent } from './decision-dialog.component';

describe('DecisionDialogComponent', () => {
  let component: DecisionDialogComponent;
  let fixture: ComponentFixture<DecisionDialogComponent>;
  let mockNOIModificationService: DeepMocked<NoticeOfIntentModificationService>;

  beforeEach(async () => {
    mockNOIModificationService = createMock();
    mockNOIModificationService.$modifications = new BehaviorSubject<NoticeOfIntentModificationDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [DecisionDialogComponent, MomentPipe, StartOfDayPipe],
      providers: [
        {
          provide: NoticeOfIntentDecisionService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockNOIModificationService,
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
