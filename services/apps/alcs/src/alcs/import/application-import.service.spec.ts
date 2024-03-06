import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Volume } from 'memfs';
import * as path from 'path';
import { initApplicationMockEntity } from '../../../test/mocks/mockEntities';
import { ApplicationMeeting } from '../application/application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from '../application/application-meeting/application-meeting.service';
import { ApplicationPaused } from '../application/application-paused.entity';
import { ApplicationPausedService } from '../application/application-paused/application-paused.service';
import { ApplicationSubmissionStatusService } from '../application/application-submission-status/application-submission-status.service';
import { ApplicationService } from '../application/application.service';
import { BoardService } from '../board/board.service';
import { Card } from '../card/card.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { ApplicationImportService } from './application-import.service';

dayjs.extend(utc);
dayjs.extend(timezone);

jest.mock('fs', () => {
  const fs = jest.requireActual('fs');

  const unionfs = require('unionfs').default;
  return unionfs.use(fs);
});

describe('ImportService', () => {
  let service: ApplicationImportService;
  let mockApplicationservice: DeepMocked<ApplicationService>;
  let mockApplicationMeetingService: DeepMocked<ApplicationMeetingService>;
  let mockPausedService: DeepMocked<ApplicationPausedService>;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  let mockDataRow;
  let mockApplication;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockApplicationservice = createMock();
    mockApplicationMeetingService = createMock();
    mockPausedService = createMock();
    mockLocalGovernmentService = createMock();
    mockBoardService = createMock();
    mockApplicationSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationImportService,
        {
          provide: ApplicationService,
          useValue: mockApplicationservice,
        },
        {
          provide: ApplicationMeetingService,
          useValue: mockApplicationMeetingService,
        },
        {
          provide: ApplicationPausedService,
          useValue: mockPausedService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
      ],
    }).compile();

    service = module.get<ApplicationImportService>(ApplicationImportService);

    mockDataRow = {
      'App ID': '1',
      Name: 'fake-applicant',
      'Submitted to ALC': new Date(),
      'Decision Maker': 'Executive',
      Region: 'fake-region',
    };

    mockApplication = initApplicationMockEntity(mockDataRow['App ID']);
    mockApplicationservice.get.mockResolvedValue(mockApplication);
    mockApplicationservice.create.mockResolvedValue(mockApplication);
    mockApplicationservice.update.mockResolvedValue(mockApplication);
    mockApplicationSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );

    mockLocalGovernmentService.getByName.mockResolvedValue({
      uuid: 'government-uuid',
    } as LocalGovernment);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load the mapping and data files from fs', async () => {
    const trackingSheetPath = path.resolve(
      __dirname,
      '..',
      'Tracking_Sheet.csv',
    );
    const mappingSheetPath = path.resolve(__dirname, '..', 'App_Listing.csv');

    const mockFs = require('fs');
    const newVolume = Volume.fromJSON({
      [trackingSheetPath]:
        '"App ID","Type","Submitted to ALC"\n"51231","SCH","2022-05-08',
      [mappingSheetPath]: '"App ID","Type","Local Gov"\n"51231","SCH","Cats',
    });
    mockFs.use(newVolume);

    await service.importCsv();

    expect(mockApplicationservice.update).toHaveBeenCalledTimes(1);
  });

  it('should create a meeting and a pause for row with request date', async () => {
    const dataRowWithRequests = {
      ...mockDataRow,
      'Request Sent (Paused)': new Date(),
      'Request Received  (Active)': new Date(),
    };
    mockPausedService.createOrUpdate.mockResolvedValue({} as ApplicationPaused);
    mockApplicationMeetingService.create.mockResolvedValue(
      {} as ApplicationMeeting,
    );

    await service.parseRow(dataRowWithRequests);

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockPausedService.createOrUpdate).toHaveBeenCalledTimes(1);
    expect(mockApplicationMeetingService.create).toHaveBeenCalledTimes(1);
  });

  it('should create a meeting and a two pauses for row with site visit', async () => {
    const dataRowWithRequests = {
      ...mockDataRow,
      'Site Visit Requested (Paused)': new Date(),
      '  Site Visit Conducted (Active)': new Date(),
      'Draft SVR Provided (Paused)': new Date(),
      'Draft SVR Verified by Applicant (Active)': new Date(),
    };
    mockPausedService.createOrUpdate.mockResolvedValue({} as ApplicationPaused);
    mockApplicationMeetingService.create.mockResolvedValue(
      {} as ApplicationMeeting,
    );

    await service.parseRow(dataRowWithRequests);

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockPausedService.createOrUpdate).toHaveBeenCalledTimes(2);
    expect(mockApplicationMeetingService.create).toHaveBeenCalledTimes(1);
  });
});
