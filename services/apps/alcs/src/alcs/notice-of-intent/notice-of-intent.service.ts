import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { filterUndefined } from '../../utils/undefined';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { CardService } from '../card/card.service';
import {
  CreateNoticeOfIntentDto,
  NoticeOfIntentDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';
import { NoticeOfIntent } from './notice-of-intent.entity';

@Injectable()
export class NoticeOfIntentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntent> = {
    card: {
      board: true,
      type: true,
      status: true,
      assignee: true,
    },
    localGovernment: true,
    region: true,
  };

  constructor(
    private cardService: CardService,
    @InjectRepository(NoticeOfIntent)
    private repository: Repository<NoticeOfIntent>,
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
  ) {}

  async create(data: CreateNoticeOfIntentDto, board: Board) {
    const existingNoticeOfIntent = await this.repository.findOne({
      where: {
        fileNumber: data.fileNumber,
      },
    });

    //TODO: Also Check Covenants?

    if (existingNoticeOfIntent) {
      throw new ServiceValidationException(
        `Notice of Intent already exists with File ID ${data.fileNumber}`,
      );
    }

    const existingApplication = await this.applicationService.get(
      data.fileNumber,
    );

    if (existingApplication) {
      throw new ServiceValidationException(
        `Application already exists with File ID ${data.fileNumber}`,
      );
    }

    const noticeOfIntent = new NoticeOfIntent({
      localGovernmentUuid: data.localGovernmentUuid,
      fileNumber: data.fileNumber,
      regionCode: data.regionCode,
      applicant: data.applicant,
      dateSubmittedToAlc: formatIncomingDate(data.dateSubmittedToAlc),
    });

    noticeOfIntent.card = await this.cardService.create('NOI', board, false);
    const savedNoticeOfIntent = await this.repository.save(noticeOfIntent);

    return this.getOrFail(savedNoticeOfIntent.uuid);
  }

  async getOrFail(uuid: string) {
    const noticeOfIntent = await this.get(uuid);
    if (!noticeOfIntent) {
      throw new ServiceNotFoundException(
        `Failed to find notice of intent with uuid ${uuid}`,
      );
    }

    return noticeOfIntent;
  }

  mapToDtos(noticeOfIntents: NoticeOfIntent[]) {
    return this.mapper.mapArrayAsync(
      noticeOfIntents,
      NoticeOfIntent,
      NoticeOfIntentDto,
    );
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
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByBoardCode(boardCode: string) {
    return this.repository.find({
      where: { card: { board: { code: boardCode } } },
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

    await this.repository.save(noticeOfIntent);

    return this.getByFileNumber(noticeOfIntent.fileNumber);
  }
}
