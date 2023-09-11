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
import { filterUndefined } from '../../utils/undefined';
import { ApplicationTimeData } from '../application/application-time-tracking.service';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { NotificationType } from './notification-type/notification-type.entity';
import {
  CreateNotificationServiceDto,
  NotificationDto,
  UpdateNotificationDto,
} from './notification.dto';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);

  private CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private DEFAULT_RELATIONS: FindOptionsRelations<Notification> = {
    card: this.CARD_RELATIONS,
    localGovernment: true,
    region: true,
    type: true,
  };

  constructor(
    private cardService: CardService,
    @InjectRepository(Notification)
    private repository: Repository<Notification>,
    @InjectRepository(NotificationType)
    private typeRepository: Repository<NotificationType>,
    @InjectMapper() private mapper: Mapper,
    private fileNumberService: FileNumberService,
    private codeService: CodeService,
    private localGovernmentService: LocalGovernmentService,
  ) {}

  async create(
    createDto: CreateNotificationServiceDto,
    board?: Board,
    persist = true,
  ) {
    await this.fileNumberService.checkValidFileNumber(createDto.fileNumber);

    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const notification = new Notification({
      localGovernmentUuid: createDto.localGovernmentUuid,
      fileNumber: createDto.fileNumber,
      regionCode: createDto.regionCode,
      applicant: createDto.applicant,
      dateSubmittedToAlc: createDto.dateSubmittedToAlc,
      type,
    });

    if (board) {
      notification.card = await this.cardService.create(
        CARD_TYPE.NOI,
        board,
        false,
      );
    }

    if (persist) {
      const savedNotification = await this.repository.save(notification);

      return this.getOrFailByUuid(savedNotification.uuid);
    }
    return notification;
  }

  async getOrFailByUuid(uuid: string) {
    const notification = await this.get(uuid);
    if (!notification) {
      throw new ServiceNotFoundException(
        `Failed to find notice of intent with uuid ${uuid}`,
      );
    }

    return notification;
  }

  async mapToDtos(notifications: Notification[]) {
    return this.mapper.mapArray(notifications, Notification, NotificationDto);
  }

  async getByCardUuid(cardUuid: string) {
    const notification = await this.repository.findOne({
      where: { cardUuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!notification) {
      throw new ServiceNotFoundException(
        `Failed to find notice of intent with card uuid ${cardUuid}`,
      );
    }

    return notification;
  }

  getBy(findOptions: FindOptionsWhere<Notification>) {
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

  async update(fileNumber: string, updateDto: UpdateNotificationDto) {
    const notification = await this.getByFileNumber(fileNumber);

    notification.summary = filterUndefined(
      updateDto.summary,
      notification.summary,
    );
    if (updateDto.localGovernmentUuid) {
      notification.localGovernmentUuid = updateDto.localGovernmentUuid;
    }

    notification.staffObservations = filterUndefined(
      updateDto.staffObservations,
      notification.staffObservations,
    );

    await this.repository.save(notification);

    return this.getByFileNumber(notification.fileNumber);
  }

  async listTypes() {
    return this.typeRepository.find();
  }

  async updateByUuid(uuid: string, updates: Partial<Notification>) {
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

  async getFileNumber(uuid: string) {
    const notification = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      select: {
        fileNumber: true,
      },
    });
    return notification.fileNumber;
  }

  async getUuid(fileNumber: string) {
    const notification = await this.repository.findOneOrFail({
      where: {
        fileNumber,
      },
      select: {
        uuid: true,
      },
    });
    return notification.uuid;
  }

  async submit(createDto: CreateNotificationServiceDto) {
    const existingNotification = await this.repository.findOne({
      where: { fileNumber: createDto.fileNumber },
    });

    if (!existingNotification) {
      throw new ServiceValidationException(
        `Notification with file number does not exist ${createDto.fileNumber}`,
      );
    }

    if (!createDto.localGovernmentUuid) {
      throw new ServiceValidationException(
        `Local government is not set for notification ${createDto.fileNumber}`,
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

    existingNotification.fileNumber = createDto.fileNumber;
    existingNotification.applicant = createDto.applicant;
    existingNotification.dateSubmittedToAlc =
      createDto.dateSubmittedToAlc || null;
    existingNotification.localGovernmentUuid = createDto.localGovernmentUuid;
    existingNotification.typeCode = createDto.typeCode;
    existingNotification.region = region;
    existingNotification.card = new Card();
    existingNotification.card.typeCode = CARD_TYPE.NOTIFICATION;

    await this.repository.save(existingNotification);
    return this.getByFileNumber(createDto.fileNumber);
  }

  async updateApplicant(fileNumber: string, applicant: string) {
    await this.repository.update(
      {
        fileNumber,
      },
      {
        applicant,
      },
    );
  }
}
