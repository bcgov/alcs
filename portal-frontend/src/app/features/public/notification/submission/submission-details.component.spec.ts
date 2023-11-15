import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CodeService } from '../../../../services/code/code.service';

import { SubmissionDetailsComponent } from './submission-details.component';

describe('SubmissionDetailsComponent', () => {
  let component: SubmissionDetailsComponent;
  let fixture: ComponentFixture<SubmissionDetailsComponent>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockCodeService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
      ],
      declarations: [SubmissionDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionDetailsComponent);
    component = fixture.componentInstance;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
