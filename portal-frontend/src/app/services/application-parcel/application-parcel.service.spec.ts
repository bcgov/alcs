import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
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
    let mockPid = 'fake';

    await service.update(mockUuid, { pid: 'fake' } as ApplicationParcelUpdateDto);

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.put.mock.calls[0][0]).toContain('application-parcel');
    expect(mockHttpClient.put.mock.calls[0][0]).toContain(mockPid);
  });

  it('should show an error toast if updating a parcel fails', async () => {
    mockHttpClient.put.mockReturnValue(throwError(() => ({})));

    await service.update(mockUuid, {} as ApplicationParcelUpdateDto);

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a get request for open file', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    await service.openFile(mockUuid);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('application-parcel-document');
  });

  it('should show an error toast if opening a file fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.openFile(mockUuid);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a delete request for delete file', async () => {
    mockHttpClient.delete.mockReturnValue(of({}));

    await service.deleteExternalFile('fileId');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.delete.mock.calls[0][0]).toContain('application-parcel-document');
  });

  it('should show an error toast if deleting a file fails', async () => {
    mockHttpClient.delete.mockReturnValue(throwError(() => ({})));

    await service.deleteExternalFile('fileId');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
