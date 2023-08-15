import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { UserDto } from '../../../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';

import { PrimaryContactComponent } from './primary-contact.component';

describe('PrimaryContactComponent', () => {
  let component: PrimaryContactComponent;
  let fixture: ComponentFixture<PrimaryContactComponent>;
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockAuthService: DeepMocked<AuthenticationService>;

  let applicationDocumentPipe = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppDocumentService = createMock();
    mockAppOwnerService = createMock();
    mockAuthService = createMock();

    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
      declarations: [PrimaryContactComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimaryContactComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    component.$applicationDocuments = applicationDocumentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
