import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { BoardDto } from '../board/board.dto';
import { ToastService } from '../toast/toast.service';
import { AdminBoardManagementService } from './admin-board-management.service';

describe('AdminBoardManagementService', () => {
  let service: AdminBoardManagementService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  let mockBoard: BoardDto = { allowedCardTypes: [], code: '', createCardTypes: [], statuses: [], title: '' };

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
    service = TestBed.inject(AdminBoardManagementService);
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

    await service.create(mockBoard);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should show toast if create fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.create(mockBoard);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call put on update', async () => {
    mockHttpClient.put.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    await service.update('fake', mockBoard);

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
  });

  it('should show toast if update fails', async () => {
    mockHttpClient.put.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.update('mock', mockBoard);

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for can delete', async () => {
    mockHttpClient.get.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    await service.canDelete('fake');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should call get for getCardTypes', async () => {
    mockHttpClient.get.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    await service.getCardTypes();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should call get for getCardCounts', async () => {
    mockHttpClient.get.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    await service.getCardCounts('board');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });
});
