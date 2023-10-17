import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../../services/toast/toast.service';

import { NfuProposalComponent } from './nfu-proposal.component';

describe('NfuProposalComponent', () => {
  let component: NfuProposalComponent;
  let fixture: ComponentFixture<NfuProposalComponent>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      declarations: [NfuProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuProposalComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    component.$applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
