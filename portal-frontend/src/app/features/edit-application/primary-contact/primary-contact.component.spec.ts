import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';

import { PrimaryContactComponent } from './primary-contact.component';

describe('PrimaryContactComponent', () => {
  let component: PrimaryContactComponent;
  let fixture: ComponentFixture<PrimaryContactComponent>;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppDocumentService = createMock();
    mockAppOwnerService = createMock();

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
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
      ],
      declarations: [PrimaryContactComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimaryContactComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
