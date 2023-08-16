import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { NOI_SUBMISSION_STATUS, NoticeOfIntentSubmissionDto } from '../notice-of-intent.dto';

import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

describe('NoticeOfIntentSubmissionService', () => {
  let service: NoticeOfIntentSubmissionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  const mockSubmittedApplication: NoticeOfIntentSubmissionDto = {
    fileNumber: '',
    uuid: '',
    createdAt: 0,
    updatedAt: 0,
    applicant: '',
    localGovernmentUuid: '',
    type: '',
    typeCode: '',
    status: {
      code: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      portalBackgroundColor: '',
      portalColor: '',
      label: '',
      description: '',
    },
    submissionStatuses: [],
    owners: [],
    canEdit: false,
    canView: false,
  };

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: mockToastService },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(NoticeOfIntentSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully fetch application submission', async () => {
    mockHttpClient.get.mockReturnValue(of(mockSubmittedApplication));

    const result = await service.fetchSubmission('1');

    expect(result).toEqual(mockSubmittedApplication);
    expect(mockHttpClient.get).toBeCalledTimes(1);
  });
});
