import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { ToastService } from '../../toast/toast.service';
import { NoiDocumentService } from './noi-document.service';

describe('ApplicationDocumentService', () => {
  let service: NoiDocumentService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  beforeEach(() => {
    httpClient = createMock();
    toastService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClient,
        },
        {
          provide: ToastService,
          useValue: toastService,
        },
      ],
    });
    service = TestBed.inject(NoiDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get call for list', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    const res = await service.listByVisibility('1', []);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('1');
  });

  it('should make a delete call for delete', async () => {
    httpClient.delete.mockReturnValue(
      of({
        uuid: '1',
      })
    );

    const res = await service.delete('1');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res.uuid).toEqual('1');
  });

  it('should show a toast warning when uploading a file thats too large', async () => {
    const file = createMock<File>();
    Object.defineProperty(file, 'size', { value: environment.maxFileSize + 1 });

    await service.upload('', {
      file,
      fileName: '',
      typeCode: DOCUMENT_TYPE.AUTHORIZATION_LETTER,
      source: DOCUMENT_SOURCE.APPLICANT,
      visibilityFlags: [],
    });

    expect(toastService.showWarningToast).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });

  it('should make a get call for list review documents', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    const res = await service.getReviewDocuments('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('1');
  });
});
