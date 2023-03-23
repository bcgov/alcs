import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { SubmittedApplicationDto, SubmittedApplicationOwnerDto } from '../application.dto';

import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  const mockSubmittedApplication: SubmittedApplicationDto = {
    parcels: [],
    otherParcels: [],
    documents: [],
    primaryContact: {} as SubmittedApplicationOwnerDto,
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
    service = TestBed.inject(ApplicationSubmissionService);
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
