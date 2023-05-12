import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDecisionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../services/toast/toast.service';

import { DecisionDocumentsComponent } from './decision-documents.component';

describe('DecisionDocumentsComponent', () => {
  let component: DecisionDocumentsComponent;
  let fixture: ComponentFixture<DecisionDocumentsComponent>;
  let mockAppDecService: DeepMocked<ApplicationDecisionV2Service>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockAppDecService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockAppDecService.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [DecisionDocumentsComponent],
      providers: [
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockAppDecService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
