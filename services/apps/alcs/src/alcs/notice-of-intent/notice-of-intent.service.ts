import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
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
import { ApplicationTimeData } from '../application/application-time-tracking.service';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardService } from '../card/card.service';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';
import {
  CreateNoticeOfIntentDto,
  NoticeOfIntentDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';
import { NoticeOfIntent } from './notice-of-intent.entity';

@Injectable()
export class NoticeOfIntentService {
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
    @InjectRepository(NoticeOfIntentSubtype)
    private subtypeRepository: Repository<NoticeOfIntentSubtype>,
    @InjectMapper() private mapper: Mapper,
    private fileNumberService: FileNumberService,
  ) {}

  async create(createDto: CreateNoticeOfIntentDto, board: Board) {
    await this.fileNumberService.checkValidFileNumber(createDto.fileNumber);

    const noticeOfIntent = new NoticeOfIntent({
      localGovernmentUuid: createDto.localGovernmentUuid,
      fileNumber: createDto.fileNumber,
      regionCode: createDto.regionCode,
      applicant: createDto.applicant,
      dateSubmittedToAlc: formatIncomingDate(createDto.dateSubmittedToAlc),
    });

    noticeOfIntent.card = await this.cardService.create(
      CARD_TYPE.NOI,
      board,
      false,
    );
    const savedNoticeOfIntent = await this.repository.save(noticeOfIntent);

    return this.getOrFailByUuid(savedNoticeOfIntent.uuid);
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

    noticeOfIntent.dateSubmittedToAlc = filterUndefined(
      formatIncomingDate(updateDto.dateSubmittedToAlc),
      noticeOfIntent.dateSubmittedToAlc,
    );

    noticeOfIntent.retroactive =
      updateDto.retroactive !== undefined
        ? updateDto.retroactive
        : noticeOfIntent.retroactive;

    await this.repository.save(noticeOfIntent);

    return this.getByFileNumber(noticeOfIntent.fileNumber);
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
        fileNumber: true,
      },
    });
    return noticeOfIntent.fileNumber;
  }
}
