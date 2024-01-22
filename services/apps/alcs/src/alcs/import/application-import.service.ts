import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as fs from 'fs';
import * as path from 'path';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { ApplicationMeetingService } from '../application/application-meeting/application-meeting.service';
import { ApplicationPausedService } from '../application/application-paused/application-paused.service';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { BOARD_CODES } from '../board/board.dto';
import { BoardService } from '../board/board.service';

dayjs.extend(utc);
dayjs.extend(timezone);

export type ApplicationRow = {
  fileNumber: string;
  applicant: string;
  submittedToAlc: Date;
  feeReceived: Date | undefined;
  ackDeficient: Date | undefined;
  ackDeficientComplete: Date | undefined;
  ackAllComplete: Date | undefined;
  ackComplete: Date | undefined;
  requestSent1: Date | undefined;
  requestRec1: Date | undefined;
  requestSent2: Date | undefined;
  requestRec2: Date | undefined;
  requestSent3: Date | undefined;
  requestRec3: Date | undefined;
  requestSent4: Date | undefined;
  requestRec4: Date | undefined;
  siteVisitRequest: Date | undefined;
  siteVisitConducted: Date | undefined;
  siteReportSent: Date | undefined;
  siteReportReviewed: Date | undefined;
  meetingScheduled: Date | undefined;
  meetingConducted: Date | undefined;
  meetingReportSent: Date | undefined;
  meetingReportReview: Date | undefined;
  decisionReleased: Date | undefined;
  decisionSentToApplication: Date | undefined;
  decisionMaker: string;
  region: string;
};

const REGION_CODE_MAP = {
  Interior: 'INTR',
  North: 'NORR',
  Island: 'ISLR',
  Kootenay: 'KOOR',
  Okanagan: 'OKAR',
  'South Coast': 'SOUR',
};

const DECISION_MAKER_BOARD_MAP = {
  'Soil/Fill Panel': BOARD_CODES.SOIL,
  'CEO Delegated': BOARD_CODES.CEO,
  Executive: BOARD_CODES.EXECUTIVE_COMMITTEE,
};

const REGION_BOARD_MAP = {
  Interior: 'inte',
  North: 'north',
  Island: 'island',
  Kootenay: 'koot',
  Okanagan: 'okan',
  'South Coast': 'south',
};

const TYPE_MAPPING = {
  INC: 'INCL',
  SDV: 'SUBD',
  EXC: 'EXCL',
  NFU: 'NFUP',
  TUR: 'TURP',
  NAR: 'NARU',
  FILL: 'POFO',
  EXT: 'ROSO',
  SCH: 'PFRS',
  CSC: '',
  SRW: '',
};

@Injectable()
export class ApplicationImportService {
  private logger: Logger = new Logger(ApplicationImportService.name);

  constructor(
    private applicationService: ApplicationService,
    private meetingService: ApplicationMeetingService,
    private pausedService: ApplicationPausedService,
    private boardService: BoardService,
    private localGovernmentService: LocalGovernmentService,
  ) {}

  importCsv() {
    this.logger.log('Import Setup Started');
    return new Promise(async (resolve) => {
      const mapping = await this.loadMappingSheet();

      const filePath = path.resolve(__dirname, '..', 'Tracking_Sheet.csv');
      const stream = fs.createReadStream(filePath);
      const processing: Promise<any>[] = [];
      let i = 0;
      stream
        .pipe(csv())
        .on('data', (data) => {
          if (data['Decision Released (Active)']) {
            return;
          }

          const promise = this.parseRow(data, mapping);
          processing.push(promise);
          i++;
        })
        .on('end', () => {
          Promise.all(processing).then(() => {
            this.logger.log(`Processed ${processing.length} Records`);
            resolve('Complete');
          });
        });
    });
  }

  async parseRow(
    data: ApplicationRow,
    mapping: Map<string, { localGovernment: string; type: string }>,
  ): Promise<void> {
    const mappedRow = this.mapRow(data);
    const existingApplication = await this.applicationService.get(
      mappedRow.fileNumber,
    );
    if (existingApplication) {
      this.logger.debug(`${mappedRow.fileNumber}: Application already exists`);
    } else {
      try {
        const sheetType = mapping.get(mappedRow.fileNumber);
        if (!sheetType) {
          this.logger.warn(`${mappedRow.fileNumber}: Not in mapping sheet`);
          return;
        }

        const mappedType = TYPE_MAPPING[sheetType.type];
        if (!mappedType) {
          this.logger.warn(
            `${mappedRow.fileNumber}: Non-importable type ${sheetType.type}`,
          );
          return;
        }

        let localGovernment = await this.localGovernmentService.getByName(
          sheetType.localGovernment,
        );
        if (!localGovernment) {
          localGovernment = await this.localGovernmentService.getByName(
            `${sheetType.localGovernment} Regional District`,
          );
          if (!localGovernment) {
            this.logger.error(
              `${mappedRow.fileNumber}: Failed to load government ${sheetType.localGovernment}`,
            );
            return;
          }
        }

        const application = await this.applicationService.create({
          fileNumber: mappedRow.fileNumber,
          applicant: mappedRow.applicant || 'Imported',
          dateSubmittedToAlc: mappedRow.submittedToAlc,
          localGovernmentUuid: localGovernment.uuid,
          regionCode: REGION_CODE_MAP[mappedRow.region] || undefined,
          typeCode: mappedType,
        });

        //Set Payment / ACK Dates
        const updatedApp = await this.applicationService.update(application, {
          feePaidDate: mappedRow.feeReceived,
          dateAcknowledgedIncomplete: mappedRow.ackDeficient,
          dateReceivedAllItems: mappedRow.ackAllComplete,
          dateAcknowledgedComplete: mappedRow.ackComplete,
        });

        await this.createMeetings(mappedRow, updatedApp);

        if (mappedRow.ackComplete) {
          if (
            mappedRow.decisionMaker === 'Regional Panel' ||
            mappedRow.decisionMaker === ''
          ) {
            const boardCode = REGION_BOARD_MAP[mappedRow.region];
            await this.boardService.changeBoard(updatedApp.cardUuid, boardCode);
          } else if (mappedRow.decisionMaker) {
            const boardCode = DECISION_MAKER_BOARD_MAP[mappedRow.decisionMaker];
            await this.boardService.changeBoard(updatedApp.cardUuid, boardCode);
          }
        }
      } catch (e) {
        this.logger.error(`${mappedRow.fileNumber}: ${e.message}`);
      }
    }
  }

  private mapRow(data: any): ApplicationRow {
    return {
      fileNumber: data['App ID'],
      applicant: data['Name'],
      submittedToAlc: dayjs(data['Submitted to ALC'])
        .tz('Canada/Pacific')
        .startOf('day')
        .toDate(),
      feeReceived: this.handleDate(data["Fee Rec'd by ALC"]),
      ackDeficient: this.handleDate(data['Deficient  Email Sent']),
      ackDeficientComplete: this.handleDate(data["Rec'd All Deficient Items"]),
      ackAllComplete: this.handleDate(data["Rec'd All Items"]),
      ackComplete: this.handleDate(data['Ack by ALC']),
      requestSent1: this.handleDate(data['Request Sent (Paused)']),
      requestRec1: this.handleDate(data['Request Received  (Active)']),
      requestSent2: this.handleDate(data['Request Sent (Paused)_1']),
      requestRec2: this.handleDate(data['Request Received  (Active)_2']),
      requestSent3: this.handleDate(data['Request Sent (Paused)_3']),
      requestRec3: this.handleDate(data['Request Received  (Active)_4']),
      requestSent4: this.handleDate(data['Request Sent (Paused)_5']),
      requestRec4: this.handleDate(data['Request Received  (Active)_6']),
      siteVisitRequest: this.handleDate(data['Site Visit Requested (Paused)']),
      siteVisitConducted: this.handleDate(
        data['  Site Visit Conducted (Active)'],
      ),
      siteReportSent: this.handleDate(data['Draft SVR Provided (Paused)']),
      siteReportReviewed: this.handleDate(
        data['Draft SVR Verified by Applicant (Active)'],
      ),
      meetingScheduled: this.handleDate(data['Scheduled (Paused)']),
      meetingConducted: this.handleDate(data['Day of Meeting (Active)']),
      meetingReportSent: this.handleDate(
        data['Draft Report Provided to Applicant (Paused)'],
      ),
      meetingReportReview: this.handleDate(
        data['Draft Report Verified by Applicant (Active)'],
      ),
      decisionReleased: this.handleDate(data['Decision Released (Active)']),
      decisionSentToApplication: this.handleDate(
        data['Decision provided to Applicant (Final Active Day)'],
      ),
      decisionMaker: data['Decision Maker'],
      region: data['Region'],
    };
  }

  private handleDate(date: string | undefined) {
    return date
      ? dayjs(date).tz('Canada/Pacific').startOf('day').toDate()
      : undefined;
  }

  private async createMeeting(
    application: Application,
    typeCode: 'IR' | 'AM' | 'SV',
    startDate?: Date,
    endDate?: Date,
    startDate2?: Date,
    endDate2?: Date,
  ) {
    try {
      if (startDate) {
        const pause = await this.pausedService.createOrUpdate({
          application,
          startDate,
          endDate,
        });

        let pause2;
        if (startDate2) {
          pause2 = await this.pausedService.createOrUpdate({
            application,
            startDate: startDate2,
            endDate: endDate2,
          });
        }

        await this.meetingService.create({
          typeCode,
          application,
          meetingPause: pause || undefined,
          reportPause: pause2,
        });
      }
    } catch (e) {
      this.logger.error(
        `Failed to create meeting for ${application.fileNumber} ${e.message}`,
      );
    }
  }

  private loadMappingSheet(): Promise<
    Map<
      string,
      {
        localGovernment: string;
        type: string;
      }
    >
  > {
    const mapping = new Map<
      string,
      {
        localGovernment: string;
        type: string;
      }
    >();
    const filePath = path.resolve(__dirname, '..', 'App_Listing.csv');
    const stream = fs.createReadStream(filePath);
    let i = 0;
    return new Promise((resolve) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          i++;
          // const appId = data['App ID'];
          // this is the fix to get the 'App ID' from csv, for some reason specifying 'App ID' did not work even though it is the same in Object.keys(data)[0]
          const appId = data[Object.keys(data)[0]];
          const type = data['Type'];
          const localGovernment = data['Local Gov'];
          mapping.set(appId, {
            localGovernment,
            type,
          });
        })
        .on('end', () => {
          this.logger.log(`Processed ${i} Mapping Records`);
          resolve(mapping);
        });
    });
  }

  private async createMeetings(
    mappedRow: ApplicationRow,
    application: Application,
  ) {
    //Create Info Requests
    await this.createMeeting(
      application,
      'IR',
      mappedRow.requestSent1,
      mappedRow.requestRec1,
    );

    await this.createMeeting(
      application,
      'IR',
      mappedRow.requestSent2,
      mappedRow.requestRec2,
    );

    await this.createMeeting(
      application,
      'IR',
      mappedRow.requestSent3,
      mappedRow.requestRec3,
    );

    await this.createMeeting(
      application,
      'IR',
      mappedRow.requestSent4,
      mappedRow.requestRec4,
    );

    //Create Site Visits
    await this.createMeeting(
      application,
      'SV',
      mappedRow.siteVisitRequest,
      mappedRow.siteVisitConducted,
      mappedRow.siteReportSent,
      mappedRow.siteReportReviewed,
    );

    //Create Applicant Meetings
    await this.createMeeting(
      application,
      'AM',
      mappedRow.meetingScheduled,
      mappedRow.meetingConducted,
      mappedRow.meetingReportSent,
      mappedRow.meetingReportReview,
    );
  }
}
