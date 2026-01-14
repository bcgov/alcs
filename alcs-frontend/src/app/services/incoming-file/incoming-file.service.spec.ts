import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IncomingFileService } from './incoming-file.service';
import { IncomingFileBoardMapDto } from './incoming-file.dto';
import { CardType } from '../../shared/card/card.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
import { of } from 'rxjs';

describe('ApplicationIncomingFileService', () => {
  let service: IncomingFileService;
  let httpTestingController: HttpTestingController;
  let toastService: DeepMocked<ToastService>;

  beforeEach(() => {
    toastService = createMock();

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        { provide: ToastService, useValue: toastService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(IncomingFileService);
    httpTestingController = TestBed.inject(HttpTestingController);
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
        isPaused: true,
      },
      {
        fileNumber: '2',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.PLAN,
        assignee: null,
        highPriority: true,
        activeDays: 12,
        isPaused: true,
      },
      {
        fileNumber: '3',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.APP,
        assignee: null,
        highPriority: true,
        activeDays: 30,
        isPaused: false,
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
        isPaused: false,
      },
      {
        fileNumber: '2',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.PLAN,
        assignee: null,
        highPriority: true,
        activeDays: 12,
        isPaused: true,
      },
      {
        fileNumber: '1',
        applicant: 'applicant',
        boardCode: 'board-1',
        type: CardType.APP,
        assignee: null,
        highPriority: false,
        activeDays: 10,
        isPaused: true,
      },
    ],
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for fetchingTypes', async () => {
    const promise = service.fetch();
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /incoming-files/.test(req.url);
    });
    req.flush(unsortedFiles, { status: 200, statusText: 'OK' });
    const res = await promise;

    expect(Object.keys(res!).length).toEqual(1);
  });

  it('should sort the incoming data based on priority and active days', async () => {
    const promise = service.fetchAndSort();
    const req = httpTestingController.expectOne((req) => {
      return req.method === 'GET' && /incoming-files/.test(req.url);
    });
    req.flush(unsortedFiles, { status: 200, statusText: 'OK' });
    const res = await promise;

    expect(res).toEqual(expectedSortedFiles);
  });
});
