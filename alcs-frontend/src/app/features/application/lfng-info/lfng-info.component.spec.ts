import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ApplicationReviewService } from '../../../services/application/application-review/application-review.service';
import { ApplicationSubmissionService } from '../../../services/application/application-submission/application-submission.service';
import { ApplicationDto } from '../../../services/application/application.dto';

import { LfngInfoComponent } from './lfng-info.component';

describe('LfngInfoComponent', () => {
  let component: LfngInfoComponent;
  let fixture: ComponentFixture<LfngInfoComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockApplicationReviewService: DeepMocked<ApplicationReviewService>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockAppDocumentService = createMock();
    mockApplicationReviewService = createMock();
    mockAppSubmissionService = createMock();
    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [LfngInfoComponent],
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ApplicationReviewService,
          useValue: mockApplicationReviewService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LfngInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
