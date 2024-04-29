import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';

import { SelectGovernmentComponent } from './select-government.component';

describe('SelectGovernmentComponent', () => {
  let component: SelectGovernmentComponent;
  let fixture: ComponentFixture<SelectGovernmentComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockAppService: DeepMocked<NoticeOfIntentSubmissionService>;

  beforeEach(async () => {
    mockCodeService = createMock();
    mockAppService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [SelectGovernmentComponent],
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        { provide: NoticeOfIntentSubmissionService, useValue: mockAppService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGovernmentComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);

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
