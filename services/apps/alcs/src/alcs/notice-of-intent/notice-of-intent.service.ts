import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { FileNumberService } from '../../file-number/file-number.service';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { filterUndefined } from '../../utils/undefined';
import { SUBMISSION_STATUS } from '../application/application-submission-status/submission-status.dto';
import { ApplicationTimeData } from '../application/application-time-tracking.service';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { NoticeOfIntentType } from '../code/application-code/notice-of-intent-type/notice-of-intent-type.entity';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { NOI_SUBMISSION_STATUS } from './notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';
import {
  CreateNoticeOfIntentServiceDto,
  NoticeOfIntentDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';
import { NoticeOfIntent } from './notice-of-intent.entity';

@Injectable()
export class NoticeOfIntentService {
  private logger = new Logger(NoticeOfIntentService.name);

  private CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntent> = {
    card: this.CARD_RELATIONS,
    localGovernment: true,
    region: true,
    subtype: true,
  };

  constructor(
    private cardService: CardService,
    @InjectRepository(NoticeOfIntent)
    private repository: Repository<NoticeOfIntent>,
    @InjectRepository(NoticeOfIntentType)
    private typeRepository: Repository<NoticeOfIntentType>,
    @InjectRepository(NoticeOfIntentSubtype)
    private subtypeRepository: Repository<NoticeOfIntentSubtype>,
    @InjectMapper() private mapper: Mapper,
    private fileNumberService: FileNumberService,
    private codeService: CodeService,
    private localGovernmentService: LocalGovernmentService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
  ) {}

  async create(
    createDto: CreateNoticeOfIntentServiceDto,
    board?: Board,
    persist = true,
  ) {
    await this.fileNumberService.checkValidFileNumber(createDto.fileNumber);

    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const noticeOfIntent = new NoticeOfIntent({
      localGovernmentUuid: createDto.localGovernmentUuid,
      fileNumber: createDto.fileNumber,
      regionCode: createDto.regionCode,
      applicant: createDto.applicant,
      dateSubmittedToAlc: createDto.dateSubmittedToAlc,
      type,
    });

    if (board) {
      noticeOfIntent.card = await this.cardService.create(
        CARD_TYPE.NOI,
        board,
        false,
      );
    }

    if (persist) {
      const savedNoticeOfIntent = await this.repository.save(noticeOfIntent);

      return this.getOrFailByUuid(savedNoticeOfIntent.uuid);
    }
    return noticeOfIntent;
  }

  async getOrFailByUuid(uuid: string) {
    const noticeOfIntent = await this.get(uuid);
    if (!noticeOfIntent) {
      throw new ServiceNotFoundException(
        `Failed to find notice of intent with uuid ${uuid}`,
      );
    }

    return noticeOfIntent;
  }

  async mapToDtos(noticeOfIntents: NoticeOfIntent[]) {
    const uuids = noticeOfIntents.map((noi) => noi.uuid);
    const timeMap = await this.getTimes(uuids);

    return noticeOfIntents.map((noi) => ({
      ...this.mapper.map(noi, NoticeOfIntent, NoticeOfIntentDto),
      activeDays: timeMap.get(noi.uuid)?.activeDays ?? null,
      pausedDays: timeMap.get(noi.uuid)?.pausedDays ?? null,
      paused: timeMap.get(noi.uuid)?.pausedDays !== null,
    }));
  }

  async getByCardUuid(cardUuid: string) {
    const noticeOfIntent = await this.repository.findOne({
      where: { cardUuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!noticeOfIntent) {
      throw new ServiceNotFoundException(
        `Failed to find notice of intent with card uuid ${cardUuid}`,
      );
    }

    return noticeOfIntent;
  }

  getBy(findOptions: FindOptionsWhere<NoticeOfIntent>) {
    return this.repository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(fileNumber: string) {
    return this.repository.find({
      where: {
        fileNumber,
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  private get(uuid: string) {
    return this.repository.findOne({
      where: {
        uuid,
      },
      relations: {
        ...this.DEFAULT_RELATIONS,
        card: { ...this.CARD_RELATIONS, board: false },
      },
    });
  }

  async getByBoard(boardUuid: string) {
    return this.repository.find({
      where: { card: { boardUuid } },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.repository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              code: subtaskType,
            },
          },
        },
      },
      relations: {
        card: {
          status: true,
          board: true,
          type: true,
          subtasks: { type: true, assignee: true },
        },
      },
    });
  }

  async getByFileNumber(fileNumber: string) {
    return this.repository.findOneOrFail({
      where: { fileNumber },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async update(fileNumber: string, updateDto: UpdateNoticeOfIntentDto) {
    const noticeOfIntent = await this.getByFileNumber(fileNumber);

    noticeOfIntent.summary = filterUndefined(
      updateDto.summary,
      noticeOfIntent.summary,
    );
    if (updateDto.localGovernmentUuid) {
      noticeOfIntent.localGovernmentUuid = updateDto.localGovernmentUuid;
    }

    if (updateDto.subtype) {
      const subtypes = await this.listSubtypes();
      const selectedSubtypes = updateDto.subtype.map(
        (code) => subtypes.find((subtype) => subtype.code === code)!,
      );
      noticeOfIntent.subtype = selectedSubtypes;
    }

    noticeOfIntent.dateAcknowledgedComplete = filterUndefined(
      formatIncomingDate(updateDto.dateAcknowledgedComplete),
      noticeOfIntent.dateAcknowledgedComplete,
    );

    noticeOfIntent.dateAcknowledgedIncomplete = filterUndefined(
      formatIncomingDate(updateDto.dateAcknowledgedIncomplete),
      noticeOfIntent.dateAcknowledgedIncomplete,
    );

    noticeOfIntent.dateReceivedAllItems = filterUndefined(
      formatIncomingDate(updateDto.dateReceivedAllItems),
      noticeOfIntent.dateReceivedAllItems,
    );

    noticeOfIntent.feePaidDate = filterUndefined(
      formatIncomingDate(updateDto.feePaidDate),
      noticeOfIntent.feePaidDate,
    );

    noticeOfIntent.feeWaived = filterUndefined(
      updateDto.feeWaived,
      noticeOfIntent.feeWaived,
    );

    noticeOfIntent.feeSplitWithLg = filterUndefined(
      updateDto.feeSplitWithLg,
      noticeOfIntent.feeSplitWithLg,
    );

    noticeOfIntent.feeAmount = filterUndefined(
      updateDto.feeAmount,
      noticeOfIntent.feeAmount,
    );

    noticeOfIntent.dateSubmittedToAlc = filterUndefined(
      formatIncomingDate(updateDto.dateSubmittedToAlc),
      noticeOfIntent.dateSubmittedToAlc,
    );

    noticeOfIntent.retroactive =
      updateDto.retroactive !== undefined
        ? updateDto.retroactive
        : noticeOfIntent.retroactive;

    await this.repository.save(noticeOfIntent);

    //Statuses
    try {
      if (updateDto.dateAcknowledgedIncomplete !== undefined) {
        await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
          noticeOfIntent.fileNumber,
          NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE,
          formatIncomingDate(updateDto.dateAcknowledgedIncomplete),
        );
      }

      if (updateDto.dateReceivedAllItems !== undefined) {
        await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
          noticeOfIntent.fileNumber,
          NOI_SUBMISSION_STATUS.RECEIVED_BY_ALC,
          formatIncomingDate(updateDto.dateReceivedAllItems),
        );
      }
    } catch (error) {
      if (error instanceof ServiceNotFoundException) {
        this.logger.warn(error.message, error);
      } else {
        throw error;
      }
    }

    return this.getByFileNumber(noticeOfIntent.fileNumber);
  }

  async listTypes() {
    return this.typeRepository.find();
  }

  async listSubtypes() {
    return this.subtypeRepository.find({
      where: {
        isActive: true,
      },
      order: {
        label: 'ASC',
      },
    });
  }

  async updateByUuid(uuid: string, updates: Partial<NoticeOfIntent>) {
    await this.repository.update(uuid, updates);
  }

  async searchByFileNumber(fileNumber: string) {
    return this.repository.find({
      where: {
        fileNumber: Like(`${fileNumber}%`),
      },
      order: {
        fileNumber: 'ASC',
      },
      relations: {
        region: true,
        localGovernment: true,
      },
    });
  }

  async getTimes(uuids: string[]) {
    const activeCounts = (await this.repository.query(
      `
        SELECT * from alcs.calculate_noi_active_days($1)`,
      [`{${uuids.join(', ')}}`],
    )) as {
      noi_uuid: string;
      paused_days: number;
      active_days: number;
    }[];

    const results = new Map<string, ApplicationTimeData>();
    uuids.forEach((appUuid) => {
      results.set(appUuid, {
        pausedDays: null,
        activeDays: null,
      });
    });
    activeCounts.forEach((time) => {
      results.set(time.noi_uuid, {
        activeDays: time.active_days,
        pausedDays: time.paused_days,
      });
    });
    return results;
  }

  async getFileNumber(uuid: string) {
    const noticeOfIntent = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      select: {
        fileNumber: true,
      },
    });
    return noticeOfIntent.fileNumber;
  }

  async getUuid(fileNumber: string) {
    const noticeOfIntent = await this.repository.findOneOrFail({
      where: {
        fileNumber,
      },
      select: {
        uuid: true,
      },
    });
    return noticeOfIntent.uuid;
  }

  async submit(createDto: CreateNoticeOfIntentServiceDto) {
    const existingNoticeOfIntent = await this.repository.findOne({
      where: { fileNumber: createDto.fileNumber },
    });

    if (!existingNoticeOfIntent) {
      throw new ServiceValidationException(
        `Notice of Intent with file number does not exist ${createDto.fileNumber}`,
      );
    }

    if (!createDto.localGovernmentUuid) {
      throw new ServiceValidationException(
        `Local government is not set for notice of intent ${createDto.fileNumber}`,
      );
    }

    let region = createDto.regionCode
      ? await this.codeService.fetchRegion(createDto.regionCode)
      : undefined;

    if (!region) {
      const localGov = await this.localGovernmentService.getByUuid(
        createDto.localGovernmentUuid,
      );
      region = localGov?.preferredRegion;
    }

    existingNoticeOfIntent.fileNumber = createDto.fileNumber;
    existingNoticeOfIntent.applicant = createDto.applicant;
    existingNoticeOfIntent.dateSubmittedToAlc =
      createDto.dateSubmittedToAlc || null;
    existingNoticeOfIntent.localGovernmentUuid = createDto.localGovernmentUuid;
    existingNoticeOfIntent.typeCode = createDto.typeCode;
    existingNoticeOfIntent.region = region;
    existingNoticeOfIntent.card = new Card();

    await this.repository.save(existingNoticeOfIntent);
    return this.getByFileNumber(createDto.fileNumber);
  }
}
