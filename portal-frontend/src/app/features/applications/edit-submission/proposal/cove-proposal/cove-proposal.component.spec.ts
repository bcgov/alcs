import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { CovenantTransfereeService } from '../../../../../services/covenant-transferee/covenant-transferee.service';
import { ToastService } from '../../../../../services/toast/toast.service';

import { CoveProposalComponent } from './cove-proposal.component';

describe('CoveProposalComponent', () => {
  let component: CoveProposalComponent;
  let fixture: ComponentFixture<CoveProposalComponent>;
  let mockTransfereeService: DeepMocked<CovenantTransfereeService>;
  let mockAppSubService: DeepMocked<ApplicationSubmissionService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockTransfereeService = createMock();
    mockAppSubService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CovenantTransfereeService,
          useValue: mockTransfereeService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      declarations: [CoveProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoveProposalComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    component.$applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
