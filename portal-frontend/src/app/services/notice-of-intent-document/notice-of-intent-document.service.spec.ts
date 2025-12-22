import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document.service';
import { OverlayContainer } from '@angular/cdk/overlay';

describe('NoticeOfIntentDocumentService', () => {
  let service: NoticeOfIntentDocumentService;
  let mockToastService: DeepMocked<ToastService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    mockToastService = createMock();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: OverlayContainer,
          useFactory: () => ({
            getContainerElement: () => document.createElement('div'),
          }),
        },
      ],
    });

    service = TestBed.inject(NoticeOfIntentDocumentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for open file', async () => {
    const promise = service.openFile('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /notice-of-intent-document\/1234\/open/.test(req.url);
    });
    req.flush({}, { status: 200, statusText: 'OK' });
    await promise;
  });

  it('should show an error toast if opening a file fails', async () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    const promise = service.openFile('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /notice-of-intent-document\/1234\/open/.test(req.url);
    });
    req.flush({}, errorResponse);
    await promise;

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a get request for download file', async () => {
    const promise = service.downloadFile('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /notice-of-intent-document\/1234\/download/.test(req.url);
    });
    req.flush({}, { status: 200, statusText: 'OK' });
    await promise;
  });

  it('should show an error toast if downloading a file fails', async () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    const promise = service.downloadFile('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /notice-of-intent-document\/1234\/download/.test(req.url);
    });
    req.flush({}, errorResponse);
    await promise;

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a delete request for delete file', async () => {
    const promise = service.deleteExternalFile('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'DELETE' && /notice-of-intent-document\/1234/.test(req.url);
    });
    req.flush({}, { status: 200, statusText: 'OK' });
    await promise;
  });

  it('should show an error toast if deleting a file fails', async () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    const promise = service.deleteExternalFile('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'DELETE' && /notice-of-intent-document\/1234/.test(req.url);
    });
    req.flush({}, errorResponse);
    await promise;

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a patch request for update file', async () => {
    const promise = service.update('1234', []);
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'PATCH' && /notice-of-intent-document\/notice-of-intent\/1234/.test(req.url);
    });
    req.flush({}, { status: 200, statusText: 'OK' });
    await promise;
  });

  it('should show an error toast if updating a file fails', async () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    const promise = service.update('1234', []);
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'PATCH' && /notice-of-intent-document\/notice-of-intent\/1234/.test(req.url);
    });
    req.flush({}, errorResponse);
    await promise;

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for deleting multiple files', async () => {
    const promise = service.deleteExternalFiles(['1234', '5678']);
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'POST' && /notice-of-intent-document\/delete-files/.test(req.url);
    });
    req.flush({}, { status: 200, statusText: 'OK' });
    await promise;
  });

  it('should show an error toast if deleting a file fails', async () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    const promise = service.deleteExternalFiles(['1234', '5678']);
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'POST' && /notice-of-intent-document\/delete-files/.test(req.url);
    });
    req.flush({}, errorResponse);
    await promise;

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a get request for getByFileId', async () => {
    const promise = service.getByFileId('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /notice-of-intent-document\/notice-of-intent\/1234/.test(req.url);
    });
    req.flush({}, { status: 200, statusText: 'OK' });
    await promise;
  });

  it('should show an error toast if getByFileId fails', async () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    const promise = service.getByFileId('1234');
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /notice-of-intent-document\/notice-of-intent\/1234/.test(req.url);
    });
    req.flush({}, errorResponse);
    await promise;

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
