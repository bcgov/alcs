import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IncomingFileService } from './incoming-file.service';
import { IncomingFileBoardMapDto } from './incoming-file.dto';
import { CardType } from '../../shared/card/card.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
import { of } from 'rxjs';

describe('ApplicationIncomingFileService', () => {
  let service: IncomingFileService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  beforeEach(() => {
    httpClient = createMock();
    toastService = createMock();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: ToastService, useValue: toastService },
      ],
    });
    service = TestBed.inject(IncomingFileService);
  });

  let unsortedFiles: IncomingFileBoardMapDto = {
    'board-1': [
      {
        fileNumber: '1',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.APP,
        assignee: null,
        highPriority: false,
        activeDays: 10,
      },
      {
        fileNumber: '2',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.PLAN,
        assignee: null,
        highPriority: true,
        activeDays: 12,
      },
      {
        fileNumber: '3',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.APP,
        assignee: null,
        highPriority: true,
        activeDays: 30,
      },
    ],
  };

  let expectedSortedFiles: IncomingFileBoardMapDto = {
    'board-1': [
      {
        fileNumber: '3',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.APP,
        assignee: null,
        highPriority: true,
        activeDays: 30,
      },
      {
        fileNumber: '2',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.PLAN,
        assignee: null,
        highPriority: true,
        activeDays: 12,
      },
      {
        fileNumber: '1',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.APP,
        assignee: null,
        highPriority: false,
        activeDays: 10,
      },
    ],
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for fetchingTypes', async () => {
    httpClient.get.mockReturnValue(of(unsortedFiles));

    const res = await service.fetch();
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(Object.keys(res!).length).toEqual(1);
  });

  it('should sort the incoming data based on priority and active days', async () => {
    httpClient.get.mockReturnValue(of(unsortedFiles));

    const res = await service.fetchAndSort();
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expectedSortedFiles);
  });
});
