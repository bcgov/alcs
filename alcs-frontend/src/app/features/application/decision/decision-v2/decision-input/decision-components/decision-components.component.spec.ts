import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../../../services/application/application-submission/application-submission.service';
import { ApplicationDto } from '../../../../../../services/application/application.dto';
import { ApplicationDecisionDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionComponentsComponent } from './decision-components.component';

describe('DecisionComponentsComponent', () => {
  let component: DecisionComponentsComponent;
  let fixture: ComponentFixture<DecisionComponentsComponent>;
  let mockApplicationDecisionV2Service: DeepMocked<ApplicationDecisionV2Service>;
  let mockToastService: DeepMocked<ToastService>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockApplicationDecisionV2Service = createMock();
    mockApplicationDecisionV2Service.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);

    mockToastService = createMock();
    mockApplicationDetailService = createMock();
    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    mockApplicationSubmissionService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [DecisionComponentsComponent],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionV2Service,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
