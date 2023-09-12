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

  const mockSubmittedNOI: NoticeOfIntentSubmissionDto = {
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
      alcsColor: '',
      alcsBackgroundColor: '',
      weight: 0,
    },
    submissionStatuses: [],
    owners: [],
    canEdit: false,
    canView: false,
    purpose: null,
    parcelsAgricultureDescription: '',
    parcelsAgricultureImprovementDescription: '',
    parcelsNonAgricultureUseDescription: '',
    northLandUseType: '',
    northLandUseTypeDescription: '',
    eastLandUseType: '',
    eastLandUseTypeDescription: '',
    southLandUseType: '',
    southLandUseTypeDescription: '',
    westLandUseType: '',
    westLandUseTypeDescription: '',
    primaryContactOwnerUuid: null,
    soilIsFollowUp: null,
    soilFollowUpIDs: null,
    soilTypeRemoved: null,
    soilToRemoveVolume: null,
    soilToRemoveArea: null,
    soilToRemoveMaximumDepth: null,
    soilToRemoveAverageDepth: null,
    soilAlreadyRemovedVolume: null,
    soilAlreadyRemovedArea: null,
    soilAlreadyRemovedMaximumDepth: null,
    soilAlreadyRemovedAverageDepth: null,
    soilToPlaceVolume: null,
    soilToPlaceArea: null,
    soilToPlaceMaximumDepth: null,
    soilToPlaceAverageDepth: null,
    soilAlreadyPlacedVolume: null,
    soilAlreadyPlacedArea: null,
    soilAlreadyPlacedMaximumDepth: null,
    soilAlreadyPlacedAverageDepth: null,
    soilProjectDurationAmount: null,
    soilIsRemovingSoilForNewStructure: null,
    soilProposedStructures: [],
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

  it('should successfully fetch noi submission', async () => {
    mockHttpClient.get.mockReturnValue(of(mockSubmittedNOI));

    const result = await service.fetchSubmission('1');

    expect(result).toEqual(mockSubmittedNOI);
    expect(mockHttpClient.get).toBeCalledTimes(1);
  });
});
