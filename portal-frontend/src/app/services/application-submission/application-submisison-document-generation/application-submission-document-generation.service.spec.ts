import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import moment from 'moment';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import * as fileModule from '../../../shared/utils/file';
import { ToastService } from '../../toast/toast.service';
import { ApplicationSubmissionDocumentGenerationService } from './application-submission-document-generation.service';

jest.mock('../../../shared/utils/file', () => ({
  ...jest.requireActual('../../../shared/utils/file'),
  getPdfFile: jest.fn(),
}));

describe('ApplicationSubmissionDocumentGenerationService', () => {
  let service: ApplicationSubmissionDocumentGenerationService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });

    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-01-01T00:00:00.000Z'));

    service = TestBed.inject(ApplicationSubmissionDocumentGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request to get pdf blob', async () => {
    mockHttpClient.get.mockReturnValue(of({}));
    const getPdfFile = jest.spyOn(fileModule, 'getPdfFile');
    getPdfFile.mockReturnValue(undefined);

    await service.generate('fake');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toBeCalledWith(`${environment.apiUrl}/generate-submission-document/fake`, {
      responseType: 'blob' as 'json',
    });
    expect(getPdfFile).toHaveBeenCalledTimes(1);
    expect(getPdfFile).toBeCalledWith(`fake_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`, {});
  });
});
