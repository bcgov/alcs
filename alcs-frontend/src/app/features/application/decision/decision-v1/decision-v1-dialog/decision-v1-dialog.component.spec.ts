import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject } from 'rxjs';
import { ApplicationModificationDto } from '../../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionService } from '../../../../../services/application/decision/application-decision-v1/application-decision.service';
import { MomentPipe } from '../../../../../shared/pipes/moment.pipe';
import { StartOfDayPipe } from '../../../../../shared/pipes/startOfDay.pipe';
import { DecisionV1DialogComponent } from './decision-v1-dialog.component';

describe('DecisionDialogComponent', () => {
  let component: DecisionV1DialogComponent;
  let fixture: ComponentFixture<DecisionV1DialogComponent>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockReconService: DeepMocked<ApplicationReconsiderationService>;

  beforeEach(async () => {
    mockModificationService = createMock();
    mockModificationService.$modifications = new BehaviorSubject<ApplicationModificationDto[]>([]);

    mockReconService = createMock();
    mockReconService.$reconsiderations = new BehaviorSubject<ApplicationReconsiderationDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [DecisionV1DialogComponent, MomentPipe, StartOfDayPipe],
      providers: [
        {
          provide: ApplicationDecisionService,
          useValue: {},
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconService,
        },
        { provide: MAT_DIALOG_DATA, useValue: { meetingType: { code: 'fake', label: 'fake' }, outcomes: [] } },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [MatDialogModule, MatSnackBarModule, ReactiveFormsModule, NgSelectModule, MatButtonToggleModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionV1DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
