import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
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

  beforeEach(async () => {
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
