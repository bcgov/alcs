import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { CARD_SUBTASK_TYPE } from '../card/card-subtask/card-subtask.dto';
import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  let httpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    httpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClient,
        },
      ],
    });
    service = TestBed.inject(HomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for assigned cards', async () => {
    const mockRes = {
      applications: [{ fileNumber: '1' }],
    };
    httpClient.get.mockReturnValue(of(mockRes));

    const res = await service.fetchAssignedToMe();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res).toEqual(mockRes);
  });

  it('should call get for subtasks', async () => {
    const mockRes = {
      applications: [{ fileNumber: '1' }],
    };
    httpClient.get.mockReturnValue(of(mockRes));

    const res = await service.fetchSubtasks(CARD_SUBTASK_TYPE.AUDIT);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res).toEqual(mockRes);
  });
});
