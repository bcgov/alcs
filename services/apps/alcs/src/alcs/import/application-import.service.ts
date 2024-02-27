import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as fs from 'fs';
import * as path from 'path';
import { ApplicationMeetingService } from '../application/application-meeting/application-meeting.service';
import { ApplicationPausedService } from '../application/application-paused/application-paused.service';
import { ApplicationSubmissionStatusService } from '../application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../application/application-submission-status/submission-status.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';

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

@Injectable()
export class ApplicationImportService {
  private logger: Logger = new Logger(ApplicationImportService.name);

  constructor(
    private applicationService: ApplicationService,
    private meetingService: ApplicationMeetingService,
    private pausedService: ApplicationPausedService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
  ) {}

  importCsv() {
    this.logger.log('Import Setup Started');
    return new Promise(async (resolve) => {
      const filePath = path.resolve(__dirname, '..', 'Tracking_Sheet.csv');
      const stream = fs.createReadStream(filePath);
      const processing: Promise<any>[] = [];
      stream
        .pipe(csv())
        .on('data', (data) => {
          const promise = this.parseRow(data);
          processing.push(promise);
        })
        .on('end', () => {
          Promise.all(processing).then(() => {
            this.logger.log(`Processed ${processing.length} Records`);
            resolve('Complete');
          });
        });
    });
  }

  async parseRow(data: ApplicationRow): Promise<void> {
    const mappedRow = this.mapRow(data);
    const existingApplication = await this.applicationService.get(
      mappedRow.fileNumber,
    );
    if (existingApplication) {
      const updatedApp = await this.applicationService.update(
        existingApplication,
        {
          dateReceivedAllItems: mappedRow.ackAllComplete,
          dateAcknowledgedComplete: mappedRow.ackComplete,
        },
      );

      await this.applicationSubmissionStatusService.setStatusDateByFileNumber(
        existingApplication.fileNumber,
        SUBMISSION_STATUS.RECEIVED_BY_ALC,
        mappedRow.ackAllComplete,
      );

      await this.createMeetings(mappedRow, updatedApp);
    } else {
      this.logger.error(`${mappedRow.fileNumber}: Application does not exist`);
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
