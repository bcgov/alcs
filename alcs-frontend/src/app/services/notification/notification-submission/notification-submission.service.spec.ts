import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { NOTIFICATION_STATUS, NotificationSubmissionDto } from '../notification.dto';

import { NotificationSubmissionService } from './notification-submission.service';

describe('NotificationSubmissionService', () => {
  let service: NotificationSubmissionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  const mockSubmittedNOI: NotificationSubmissionDto = {
    contactEmail: null,
    contactFirstName: null,
    contactLastName: null,
    contactOrganization: null,
    contactPhone: null,
    lastStatusUpdate: 0,
    transferees: [],
    fileNumber: '',
    uuid: '',
    createdAt: 0,
    updatedAt: 0,
    applicant: '',
    localGovernmentUuid: '',
    type: '',
    typeCode: '',
    status: {
      code: NOTIFICATION_STATUS.IN_PROGRESS,
      portalBackgroundColor: '',
      portalColor: '',
      label: '',
      description: '',
      alcsBackgroundColor: '',
      weight: 0,
      alcsColor: '',
    },
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
    service = TestBed.inject(NotificationSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully fetch notification submission', async () => {
    mockHttpClient.get.mockReturnValue(of(mockSubmittedNOI));

    const result = await service.fetchSubmission('1');

    expect(result).toEqual(mockSubmittedNOI);
    expect(mockHttpClient.get).toBeCalledTimes(1);
  });

  it('should make a patch request for email', async () => {
    mockHttpClient.patch.mockReturnValue(of(mockSubmittedNOI));

    const result = await service.setContactEmail('1', '1');

    expect(result).toEqual(mockSubmittedNOI);
    expect(mockHttpClient.patch).toBeCalledTimes(1);
  });
});
