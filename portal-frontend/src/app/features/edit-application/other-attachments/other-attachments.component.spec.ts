import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';

import { OtherAttachmentsComponent } from './other-attachments.component';

describe('OtherAttachmentsComponent', () => {
  let component: OtherAttachmentsComponent;
  let fixture: ComponentFixture<OtherAttachmentsComponent>;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppDocumentService = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationProposalService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      declarations: [OtherAttachmentsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherAttachmentsComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
