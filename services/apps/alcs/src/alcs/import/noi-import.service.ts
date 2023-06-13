import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as fs from 'fs';
import * as path from 'path';
import { ApplicationLocalGovernmentService } from '../application/application-code/application-local-government/application-local-government.service';
import { BoardService } from '../board/board.service';
import { CardService } from '../card/card.service';
import { NoticeOfIntentDecisionService } from '../notice-of-intent-decision/notice-of-intent-decision.service';
import { NoticeOfIntentMeetingService } from '../notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentSubtype } from '../notice-of-intent/notice-of-intent-subtype.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';

dayjs.extend(utc);
dayjs.extend(timezone);

export type NOIRow = {
  fileNumber: string;
  applicant?: string;
  submittedToAlc: Date;
  feeReceived: Date | undefined;
  ackDeficient: Date | undefined;
  ackAllComplete: Date | undefined;
  ackComplete: Date | undefined;
  subtype1: string | undefined;
  subtype2: string | undefined;
  retroactive: string | undefined;
  requestSent1: Date | undefined;
  requestRec1: Date | undefined;
  requestSent2: Date | undefined;
  requestRec2: Date | undefined;
  requestSent3: Date | undefined;
  requestRec3: Date | undefined;
  requestSent4: Date | undefined;
  requestRec4: Date | undefined;
  decisionReleased: Date | undefined;
  decisionSentToApplication: Date | undefined;
  cityOrDistrict: string;
  region: string;
  outcome: string | undefined;
  auditDate: Date | undefined;
};

const REGION_CODE_MAP = {
  Interior: 'INTR',
  'North ': 'NORR',
  Island: 'ISLR',
  island: 'ISLR',
  Kootenay: 'KOOR',
  Okanagan: 'OKAR',
  'South Coast': 'SOUR',
};

const GOVERNMENT_NAME_MAP = {
  'district of chetwynd': 'District of Chetwynd',
  'Regional District of Okanagan-Similkameen':
    'Okanagan Similkameen Regional District',
  'Okanagan-Similkameen Regional District':
    'Okanagan Similkameen Regional District',
  'Regional District of North Okanagan': 'North Okanagan Regional District',
  'Corporation of Delta': 'City of Delta',
  'District of Fraser Fort George': 'Fraser Fort George Regional District',
  'Kitimat-Stikine Regional District': 'Kitimat Stikine Regional District',
  'Dist of North Cowichan': 'District of North Cowichan',
  'city of Abbotsford': 'City of Abbotsford',
  'Bulkley-Nechako': 'Bulkley-Nechako Regional District',
};

@Injectable()
export class NoticeOfIntentImportService {
  private logger: Logger = new Logger(NoticeOfIntentImportService.name);

  private subTypes: NoticeOfIntentSubtype[] = [];

  constructor(
    private noticeOfIntentService: NoticeOfIntentService,
    private meetingService: NoticeOfIntentMeetingService,
    private boardService: BoardService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private cardService: CardService,
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionService,
  ) {}

  importNoiCsv() {
    this.logger.log('Import Setup Started');

    return new Promise(async (resolve) => {
      this.subTypes = await this.noticeOfIntentService.listSubtypes();

      const mapping = await this.loadMappingSheet();

      const filePath = path.resolve(__dirname, '..', 'NOI_Import.csv');
      const stream = fs.createReadStream(filePath);
      const processing: Promise<any>[] = [];
      let i = 0;
      stream
        .pipe(csv())
        .on('data', (data) => {
          if (
            data['Notice ID'] === '' ||
            (data['Decision Version'] !== '' &&
              data['Decision Version'] !== '1')
          ) {
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

  async parseRow(data: any, mapping: Map<string, string>): Promise<void> {
    const mappedRow = this.mapRow(data);

    try {
      await this.noticeOfIntentService.getByFileNumber(mappedRow.fileNumber);
      this.logger.debug(`${mappedRow.fileNumber}: Application already exists`);
      return;
    } catch (e) {}

    try {
      const resolutionData = mapping.get(mappedRow.fileNumber);
      if (!resolutionData && mappedRow.decisionReleased) {
        this.logger.warn(`${mappedRow.fileNumber}: Not in mapping sheet`);
        return;
      }

      const mappedGovernmentName = this.getGovernmentName(
        mappedRow.cityOrDistrict.trim(),
      );

      const localGovernment = await this.localGovernmentService.getByName(
        mappedGovernmentName,
      );

      if (!localGovernment) {
        this.logger.error(
          `${mappedRow.fileNumber}: Failed to load government "${mappedGovernmentName}"`,
        );
        return;
      }

      const vettingBoard = await this.boardService.getOneOrFail({
        code: 'vett',
      });
      const regionCode = REGION_CODE_MAP[mappedRow.region];
      if (!regionCode) {
        this.logger.error(
          `${mappedRow.fileNumber}: Failed to find region ${mappedRow.region}`,
        );
        return;
      }

      const noticeOfIntent = await this.noticeOfIntentService.create(
        {
          fileNumber: mappedRow.fileNumber,
          applicant: mappedRow.applicant || 'Unknown',
          dateSubmittedToAlc: mappedRow.submittedToAlc.getTime(),
          localGovernmentUuid: localGovernment.uuid,
          regionCode: regionCode,
          boardCode: 'noi',
        },
        vettingBoard,
      );
      const subtypes = this.mapSubTypes(mappedRow);

      //Set Payment / ACK Dates
      const updatedNoi = await this.noticeOfIntentService.update(
        noticeOfIntent.fileNumber,
        {
          feePaidDate: mappedRow.feeReceived?.getTime(),
          dateAcknowledgedIncomplete: mappedRow.ackDeficient?.getTime(),
          dateReceivedAllItems: mappedRow.ackAllComplete?.getTime(),
          dateAcknowledgedComplete: mappedRow.ackComplete?.getTime(),
          retroactive: mappedRow.retroactive === 'Y',
          subtype: subtypes,
        },
      );

      await this.createMeetings(mappedRow, updatedNoi);

      if (mappedRow.ackComplete) {
        await this.boardService.changeBoard(updatedNoi.cardUuid, 'noi');
      }

      if (mappedRow.outcome) {
        await this.cardService.archive(updatedNoi.cardUuid);
      }

      await this.createDecisions(mappedRow, updatedNoi, resolutionData);
    } catch (e) {
      this.logger.error(`${mappedRow.fileNumber}: ${e.message}`);
    }
  }

  private mapSubTypes(mappedRow: NOIRow) {
    const subtypes: string[] = [];

    ['subtype1', 'subtype2'].forEach((fieldKey) => {
      let subtype = mappedRow[fieldKey];

      //Quick data fix for single type with typo
      if (subtype === 'Farm Building -  Intensive Livestock') {
        subtype = 'Farm Building - Intensive Livestock';
      }

      if (subtype) {
        const mappedType = this.subTypes.find((type) => type.label === subtype);
        if (mappedType && !subtypes.includes(mappedType.code)) {
          subtypes.push(mappedType.code);
        } else if (!mappedType) {
          console.log(`Failed to Match Subtype ${subtype}`);
        }
      }
    });

    return subtypes;
  }

  private mapRow(data: any): NOIRow {
    const keys = Object.keys(data);
    return {
      fileNumber: data['Notice ID'],
      applicant: data['Name'],
      submittedToAlc: dayjs(data['Submitted to ALC'])
        .tz('Canada/Pacific')
        .startOf('day')
        .toDate(),
      feeReceived: this.handleDate(data["Fee Rec'd by ALC"]),
      ackDeficient: this.handleDate(data['Deficient Email Sent']),
      ackAllComplete: this.handleDate(data["Rec'd All Items"]),
      ackComplete: this.handleDate(data['Ack Complete by ALC']),
      subtype1: data['NOI Type Primary '],
      subtype2: data['NOI Type Secondary \n(if applicable) '],
      retroactive: data['Retroactive NOI \n(Y/N)'],
      //Use keys here as they all have the same column name
      requestSent1: this.handleDate(data[keys[15]]),
      requestRec1: this.handleDate(data[keys[16]]),
      requestSent2: this.handleDate(data[keys[17]]),
      requestRec2: this.handleDate(data[keys[18]]),
      requestSent3: this.handleDate(data[keys[19]]),
      requestRec3: this.handleDate(data[keys[20]]),
      requestSent4: this.handleDate(data[keys[21]]),
      requestRec4: this.handleDate(data[keys[22]]),
      decisionReleased: this.handleDate(data['Letter Released ']),
      decisionSentToApplication: this.handleDate(
        data['Decision provided to Applicant (Final Active Day)'],
      ),
      cityOrDistrict: data['City or District'],
      region: data['Region '],
      outcome: data['Outcome'],
      auditDate: this.handleDate(data['Audited ']),
    };
  }

  private handleDate(date: string | undefined) {
    return date
      ? dayjs(date).tz('Canada/Pacific').startOf('day').toDate()
      : undefined;
  }

  private async createMeeting(
    noticeOfIntent: NoticeOfIntent,
    startDate?: Date,
    endDate?: Date,
  ) {
    if (!startDate) {
      return;
    }

    try {
      await this.meetingService.create({
        meetingTypeCode: 'IR',
        meetingStartDate: startDate.getTime(),
        meetingEndDate: endDate?.getTime(),
        noticeOfIntentUuid: noticeOfIntent.uuid,
      });
    } catch (e) {
      this.logger.error(
        `Failed to create meeting for ${noticeOfIntent.fileNumber} ${e.message}`,
      );
    }
  }

  private loadMappingSheet(): Promise<Map<string, string>> {
    const mapping = new Map<string, string>();
    const filePath = path.resolve(__dirname, '..', 'NOI_Listing.csv');
    const stream = fs.createReadStream(filePath);
    let i = 0;
    return new Promise((resolve) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          i++;
          const appId = data[Object.keys(data)[0]];
          const resolutionNumber = data['RESOLUTION_NUMBER'];
          mapping.set(appId, resolutionNumber);
        })
        .on('end', () => {
          this.logger.log(`Processed ${i} Mapping Records`);
          resolve(mapping);
        });
    });
  }

  private async createMeetings(
    mappedRow: NOIRow,
    noticeOfIntent: NoticeOfIntent,
  ) {
    //Create Info Requests
    await this.createMeeting(
      noticeOfIntent,
      mappedRow.requestSent1,
      mappedRow.requestRec1,
    );

    await this.createMeeting(
      noticeOfIntent,
      mappedRow.requestSent2,
      mappedRow.requestRec2,
    );

    await this.createMeeting(
      noticeOfIntent,
      mappedRow.requestSent3,
      mappedRow.requestRec3,
    );

    await this.createMeeting(
      noticeOfIntent,
      mappedRow.requestSent4,
      mappedRow.requestRec4,
    );
  }

  private getGovernmentName(governmentName: string) {
    const mappedName = GOVERNMENT_NAME_MAP[governmentName];
    return mappedName ?? governmentName;
  }

  private async createDecisions(
    mappedRow: NOIRow,
    updatedApp: NoticeOfIntent,
    resolutionData: string | undefined,
  ) {
    if (mappedRow.decisionReleased && resolutionData) {
      const resolutionYear = parseInt(
        resolutionData?.substring(resolutionData?.length - 4),
      );
      const resolutionNumber = parseInt(
        resolutionData.substring(0, resolutionData?.length - 4),
      );

      await this.noticeOfIntentDecisionService.create(
        {
          date: mappedRow.decisionReleased.getTime(),
          decisionMaker: 'CEO Delegate',
          applicationFileNumber: mappedRow.fileNumber,
          outcomeCode: mappedRow.outcome === 'Approved' ? 'APPR' : 'ONTP',
          resolutionNumber: resolutionNumber,
          resolutionYear: resolutionYear,
          auditDate: mappedRow.auditDate?.getTime(),
        },
        updatedApp,
        undefined,
      );
    }
  }
}
