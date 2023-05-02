import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationDecisionDto } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionV2Component } from './decision-v2.component';

describe('DecisionV2Component', () => {
  let component: DecisionV2Component;
  let fixture: ComponentFixture<DecisionV2Component>;
  let mockApplicationDecisionService: DeepMocked<ApplicationDecisionV2Service>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockApplicationDecisionService = createMock();
    mockApplicationDecisionService.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
    mockApplicationDecisionService.$decisions = new BehaviorSubject<ApplicationDecisionDto[] | []>([]);

    mockAppDetailService = createMock();
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    mockRouter = createMock()

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      declarations: [DecisionV2Component],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionService,
        },
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
