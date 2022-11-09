import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Volume, fs } from 'memfs';
import * as path from 'path';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../application/application-code/application-local-government/application-local-government.service';
import { ApplicationMeeting } from '../application/application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from '../application/application-meeting/application-meeting.service';
import { ApplicationPaused } from '../application/application-paused.entity';
import { ApplicationPausedService } from '../application/application-paused/application-paused.service';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { BoardService } from '../board/board.service';
import { Card } from '../card/card.entity';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';
import { ImportService } from './import.service';

dayjs.extend(utc);
dayjs.extend(timezone);

jest.mock('fs', () => {
  const fs = jest.requireActual('fs');

  const unionfs = require('unionfs').default;
  return unionfs.use(fs);
});

describe('ImportService', () => {
  let service: ImportService;
  let mockApplicationservice: DeepMocked<ApplicationService>;
  let mockApplicationMeetingService: DeepMocked<ApplicationMeetingService>;
  let mockPausedService: DeepMocked<ApplicationPausedService>;
  let mockLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockBoardService: DeepMocked<BoardService>;

  let mockDataRow;
  let mockApplication;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockApplicationservice = createMock<ApplicationService>();
    mockApplicationMeetingService = createMock<ApplicationMeetingService>();
    mockPausedService = createMock<ApplicationPausedService>();
    mockLocalGovernmentService =
      createMock<ApplicationLocalGovernmentService>();
    mockBoardService = createMock<BoardService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
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
          provide: ApplicationLocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);

    mockDataRow = {
      'App ID': '1',
      Name: 'fake-applicant',
      'Submitted to ALC': new Date(),
      'Decision Maker': 'Executive',
      Region: 'fake-region',
    };

    mockApplicationservice.get.mockResolvedValue(null);
    mockApplication = initApplicationMockEntity(mockDataRow['App ID']);
    mockApplicationservice.create.mockResolvedValue(mockApplication);
    mockApplicationservice.update.mockResolvedValue(mockApplication);

    mockLocalGovernmentService.getByName.mockResolvedValue({
      uuid: 'government-uuid',
    } as ApplicationLocalGovernment);
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

    expect(mockApplicationservice.create).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledWith({
      applicant: 'Imported',
      dateReceived: dayjs('2022-05-08')
        .tz('Canada/Pacific')
        .startOf('day')
        .toDate(),
      fileNumber: '51231',
      localGovernmentUuid: 'government-uuid',
      regionCode: undefined,
      typeCode: 'PFRS',
    });
  });

  it('should do nothing if the file already exists', async () => {
    mockApplicationservice.get.mockResolvedValue({} as Application);

    await service.parseRow(mockDataRow, new Map());

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(0);
  });

  it('should do nothing if there is no mapping data', async () => {
    await service.parseRow(mockDataRow, new Map());

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(0);
  });

  it('should create a new application if the file does not exist', async () => {
    await service.parseRow(
      mockDataRow,
      new Map([
        [
          mockApplication.fileNumber,
          {
            type: 'SDV',
            localGovernment: 'lg',
          },
        ],
      ]),
    );

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(1);
  });

  it('should should do a fallback search for local government', async () => {
    mockLocalGovernmentService.getByName.mockResolvedValueOnce(null);
    mockLocalGovernmentService.getByName.mockResolvedValueOnce(
      {} as ApplicationLocalGovernment,
    );
    await service.parseRow(
      mockDataRow,
      new Map([
        [
          mockApplication.fileNumber,
          {
            type: 'SDV',
            localGovernment: 'lg',
          },
        ],
      ]),
    );

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(1);
    expect(mockLocalGovernmentService.getByName).toHaveBeenCalledTimes(2);
    expect(mockLocalGovernmentService.getByName).toHaveBeenCalledWith('lg');
    expect(mockLocalGovernmentService.getByName).toHaveBeenCalledWith(
      'lg Regional District',
    );
  });

  it('should change the board if the row is ackComplete', async () => {
    const dataRowWithAckComplete = {
      ...mockDataRow,
      'Ack by ALC': new Date(),
    };
    mockBoardService.changeBoard.mockResolvedValue({} as Card);

    await service.parseRow(
      dataRowWithAckComplete,
      new Map([
        [
          mockApplication.fileNumber,
          {
            type: 'SDV',
            localGovernment: 'lg',
          },
        ],
      ]),
    );

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(1);
    expect(mockBoardService.changeBoard).toHaveBeenCalledTimes(1);
    expect(mockBoardService.changeBoard).toHaveBeenCalledWith(
      mockApplication.cardUuid,
      'exec',
    );
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

    await service.parseRow(
      dataRowWithRequests,
      new Map([
        [
          mockApplication.fileNumber,
          {
            type: 'SDV',
            localGovernment: 'lg',
          },
        ],
      ]),
    );

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(1);
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

    await service.parseRow(
      dataRowWithRequests,
      new Map([
        [
          mockApplication.fileNumber,
          {
            type: 'SDV',
            localGovernment: 'lg',
          },
        ],
      ]),
    );

    expect(mockApplicationservice.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.create).toHaveBeenCalledTimes(1);
    expect(mockPausedService.createOrUpdate).toHaveBeenCalledTimes(2);
    expect(mockApplicationMeetingService.create).toHaveBeenCalledTimes(1);
  });
});
