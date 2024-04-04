import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';

import { SelectGovernmentComponent } from './select-government.component';

describe('SelectGovernmentComponent', () => {
  let component: SelectGovernmentComponent;
  let fixture: ComponentFixture<SelectGovernmentComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;

  beforeEach(async () => {
    mockCodeService = createMock();
    mockNotificationSubmissionService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [SelectGovernmentComponent],
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        { provide: NotificationSubmissionService, useValue: mockNotificationSubmissionService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGovernmentComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);

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
