import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';

import { ApplicationOwnerService } from './application-owner.service';

describe('ApplicationOwnerService', () => {
  let service: ApplicationOwnerService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let fileId = '123';

  beforeEach(() => {
    mockHttpClient = createMock();
    mockToastService = createMock();
    mockDocumentService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    });
    service = TestBed.inject(ApplicationOwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for loading owners', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    await service.fetchBySubmissionId(fileId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if getting owners fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.fetchBySubmissionId(fileId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for create', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.create({
      applicationFileNumber: '',
      email: '',
      phoneNumber: '',
      typeCode: '',
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if creating owner fails', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.create({
      applicationFileNumber: '',
      email: '',
      phoneNumber: '',
      typeCode: '',
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a patch request for update', async () => {
    mockHttpClient.patch.mockReturnValue(of({}));

    await service.update('', {
      email: '',
      phoneNumber: '',
      typeCode: '',
    });

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.patch.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if updating owner fails', async () => {
    mockHttpClient.patch.mockReturnValue(throwError(() => ({})));

    await service.update('', {
      email: '',
      phoneNumber: '',
      typeCode: '',
    });

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a delete request for delete', async () => {
    mockHttpClient.delete.mockReturnValue(of({}));

    await service.delete('');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.delete.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if delete owner fails', async () => {
    mockHttpClient.delete.mockReturnValue(throwError(() => ({})));

    await service.delete('');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for removeFromParcel', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.removeFromParcel('', '');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if removeFromParcel', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.removeFromParcel('', '');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for linkToParcel', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.linkToParcel('', '');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if linkToParcel', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.linkToParcel('', '');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for setPrimaryContact', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.setPrimaryContact({ fileNumber: '' });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('application-owner');
  });

  it('should show an error toast if setPrimaryContact', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.setPrimaryContact({ fileNumber: '' });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
