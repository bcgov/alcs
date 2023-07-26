import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '../../../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { InclProposalComponent } from './incl-proposal.component';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';

describe('InclProposalComponent', () => {
  let component: InclProposalComponent;
  let fixture: ComponentFixture<InclProposalComponent>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockAppDocumentService = createMock();
    mockAuthService = createMock();
    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [InclProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InclProposalComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    component.$applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
