import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import moment from 'moment';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { openPdfFile } from '../../shared/utils/file';
import * as fileModule from '../../shared/utils/file';
import { ToastService } from '../toast/toast.service';
import { PdfGenerationService } from './pdf-generation.service';

jest.mock('../../shared/utils/file', () => ({
  ...jest.requireActual('../../shared/utils/file'),
  openPdfFile: jest.fn(),
}));

describe('PdfGenerationService', () => {
  let service: PdfGenerationService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    jest.resetAllMocks();

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

    service = TestBed.inject(PdfGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for generate submission PDF', async () => {
    mockHttpClient.get.mockReturnValue(of({}));
    const getPdfFile = jest.spyOn(fileModule, 'openPdfFile');
    getPdfFile.mockReturnValue(undefined);

    await service.generateSubmission('fake');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toBeCalledWith(`${environment.apiUrl}/pdf-generation/fake/submission`, {
      responseType: 'blob' as 'json',
    });
    expect(getPdfFile).toHaveBeenCalledTimes(1);
    expect(getPdfFile).toBeCalledWith(`fake_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`, {});
  });

  it('should make a get request for generate review PDF', async () => {
    mockHttpClient.get.mockReturnValue(of({}));
    const getPdfFile = jest.spyOn(fileModule, 'openPdfFile');
    getPdfFile.mockReturnValue(undefined);

    await service.generateReview('fake');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toBeCalledWith(`${environment.apiUrl}/pdf-generation/fake/review`, {
      responseType: 'blob' as 'json',
    });
    expect(getPdfFile).toHaveBeenCalledTimes(1);
    expect(getPdfFile).toBeCalledWith(`fake-Review_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`, {});
  });
});
