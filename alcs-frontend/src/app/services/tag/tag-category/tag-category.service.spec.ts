import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { TagCategoryService } from './tag-category.service';

describe('TagCategoryService', () => {
  let service: TagCategoryService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(() => {
    mockHttpClient = createMock();
    mockToastService = createMock();

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
      ],
    });
    service = TestBed.inject(TagCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call post on create', async () => {
    mockHttpClient.post.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    const res = await service.create({
      uuid: '',
      name: '',
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('fake');
  });

  it('should call patch on update', async () => {
    mockHttpClient.patch.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    const res = await service.update('fake', {
      uuid: '',
      name: '',
    });

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('fake');
  });

  it('should call get on fetch', async () => {
    mockHttpClient.get.mockReturnValue(of([]));

    await service.fetch(0, 0);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should call delete on delete', async () => {
    mockHttpClient.delete.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    const res = await service.delete('fake');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('fake');
  });
});
