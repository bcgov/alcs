import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../toast/toast.service';

import { of, throwError } from 'rxjs';
import { DocumentService } from '../document/document.service';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockToastService: DeepMocked<ToastService>;

  const mockUuid = 'fake_uuid';

  beforeEach(() => {
    mockHttpClient = createMock();
    mockToastService = createMock();

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
      ],
    });
    service = TestBed.inject(ApplicationParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for loading parcels', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    await service.fetchByFileId(mockUuid);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('application-parcel');
  });

  it('should show an error toast if getting parcel fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.fetchByFileId(mockUuid);

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

  it('should show an error toast if updating a parcel fails', async () => {
    mockHttpClient.put.mockReturnValue(throwError(() => ({})));

    await service.update([{}] as ApplicationParcelUpdateDto[]);

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
