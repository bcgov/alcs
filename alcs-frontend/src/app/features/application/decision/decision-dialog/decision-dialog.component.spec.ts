import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject } from 'rxjs';
import { ApplicationModificationDto } from '../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import { ApplicationReconsiderationDto } from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';
import { StartOfDayPipe } from '../../../../shared/pipes/startOfDay.pipe';
import { DecisionDialogComponent } from './decision-dialog.component';

describe('DecisionDialogComponent', () => {
  let component: DecisionDialogComponent;
  let fixture: ComponentFixture<DecisionDialogComponent>;

  beforeEach(async () => {
    const mockModificationService = jasmine.createSpyObj<ApplicationModificationService>(
      'ApplicationModificationService',
      ['fetchByApplication']
    );
    mockModificationService.$modifications = new BehaviorSubject<ApplicationModificationDto[]>([]);

    const mockReconService = jasmine.createSpyObj<ApplicationReconsiderationService>(
      'ApplicationReconsiderationService',
      ['fetchByApplication']
    );
    mockReconService.$reconsiderations = new BehaviorSubject<ApplicationReconsiderationDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [DecisionDialogComponent, MomentPipe, StartOfDayPipe],
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
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
