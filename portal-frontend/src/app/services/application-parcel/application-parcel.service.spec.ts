import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { of, throwError } from 'rxjs';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockOverlayService: DeepMocked<OverlaySpinnerService>;

  const mockUuid = 'fake_uuid';

  beforeEach(() => {
    mockHttpClient = createMock();
    mockToastService = createMock();
    mockDocumentService = createMock();
    mockOverlayService = createMock();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: OverlaySpinnerService,
          useValue: mockOverlayService,
        },
      ],
    });
    service = TestBed.inject(ApplicationParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for loading parcels', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    await service.fetchBySubmissionUuid(mockUuid);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('application-parcel');
  });

  it('should show an error toast if getting parcel fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.fetchBySubmissionUuid(mockUuid);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for create', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.create(mockUuid);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('application-parcel');
  });

  it('should show an error toast if creating a parcel fails', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.create(mockUuid);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a put request for update', async () => {
    mockHttpClient.put.mockReturnValue(of({}));
    let mockUuid = 'fake';

    await service.update([{ uuid: mockUuid }] as ApplicationParcelUpdateDto[]);

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.put.mock.calls[0][0]).toContain('application-parcel');
  });

  it('should call document service for attaching certificate of title', async () => {
    mockDocumentService.uploadFile.mockResolvedValue({});

    await service.attachCertificateOfTitle('fileId', 'parcelUuid', {} as File);

    expect(mockDocumentService.uploadFile).toHaveBeenCalledTimes(1);
  });

  it('should make a delete request and show the overlay for removing all parcels', async () => {
    mockDocumentService.uploadFile.mockRejectedValue({});
    mockOverlayService.showSpinner.mockReturnValue();
    mockOverlayService.hideSpinner.mockReturnValue();
    mockHttpClient.delete.mockReturnValue(of({}));

    await service.deleteMany([]);

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockOverlayService.showSpinner).toHaveBeenCalledTimes(1);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledTimes(1);
    expect(mockOverlayService.hideSpinner).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast if document service fails', async () => {
    mockDocumentService.uploadFile.mockRejectedValue({});
    mockOverlayService.showSpinner.mockReturnValue();
    mockOverlayService.hideSpinner.mockReturnValue();
    mockHttpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    await service.deleteMany([]);

    expect(mockOverlayService.showSpinner).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
    expect(mockOverlayService.hideSpinner).toHaveBeenCalledTimes(1);
  });
});
