import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { CardCreateDto } from '../card/card.dto';
import { CardService } from '../card/card.service';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../common/exceptions/base.exception';
import { formatIncomingDate } from '../utils/incoming-date.formatter';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
  ApplicationReconsiderationWithoutApplicationDto,
  ReconsiderationTypeDto,
} from './applicationReconsideration.dto';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

@Injectable()
export class ApplicationReconsiderationService {
  constructor(
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private cardService: CardService,
    @InjectRepository(ApplicationReconsiderationType)
    private reconsiderationTypeRepository: Repository<ApplicationReconsiderationType>,
  ) {}

  private DEFAULT_RECONSIDERATION_RELATIONS: FindOptionsRelations<ApplicationReconsideration> =
    {
      application: {
        type: true,
        region: true,
        localGovernment: true,
        decisionMeetings: true,
      },
      card: {
        board: true,
        type: true,
        status: true,
        assignee: true,
      },
      type: true,
    };

  // TODO: merge getByBoard and getByApplication into one method
  async getByBoardCode(boardCode: string) {
    return this.reconsiderationRepository.find({
      where: { card: { board: { code: boardCode } } },
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  async getByApplication(applicationFileNumber: string) {
    return this.reconsiderationRepository.find({
      where: { application: { fileNumber: applicationFileNumber } },
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  async mapToDtos(
    reconsiderations: ApplicationReconsideration[],
  ): Promise<ApplicationReconsiderationDto[]> {
    return this.mapper.mapArrayAsync(
      reconsiderations,
      ApplicationReconsideration,
      ApplicationReconsiderationDto,
    );
  }

  async mapToDtosWithoutApplication(
    reconsiderations: ApplicationReconsideration[],
  ): Promise<ApplicationReconsiderationWithoutApplicationDto[]> {
    return this.mapper.mapArrayAsync(
      reconsiderations,
      ApplicationReconsideration,
      ApplicationReconsiderationWithoutApplicationDto,
    );
  }

  async create(
    reconsideration: ApplicationReconsiderationCreateDto,
    board: Board,
  ) {
    const type = await this.fetchAndValidateType(reconsideration.reconTypeCode);

    const newReconsideration = new ApplicationReconsideration({
      submittedDate: new Date(reconsideration.submittedDate),
    });

    const newCard = await this.cardService.create(
      {
        boardCode: reconsideration.boardCode,
        typeCode: 'RECON',
      } as CardCreateDto,
      board,
      false,
    );

    newReconsideration.card = newCard;
    newReconsideration.type = type;

    newReconsideration.application = await this.getOrCreateApplication(
      reconsideration,
    );

    const recon = await this.reconsiderationRepository.save(newReconsideration);
    return this.getByUuid(recon.uuid);
  }

  private async getOrCreateApplication(
    reconsideration: ApplicationReconsiderationCreateDto,
  ) {
    const existingApplication = await this.applicationService.get(
      reconsideration.applicationFileNumber,
    );

    if (existingApplication) {
      return existingApplication;
    } else {
      return await this.applicationService.create(
        {
          fileNumber: reconsideration.applicationFileNumber,
          type: reconsideration.applicationTypeCode,
          region: reconsideration.region,
          localGovernmentUuid: reconsideration.localGovernmentUuid,
          applicant: reconsideration.applicant,
          dateReceived: reconsideration.submittedDate,
        },
        false,
      );
    }
  }

  async update(uuid: string, updates: ApplicationReconsiderationUpdateDto) {
    const existingReconsideration = await this.fetchAndValidateReconsideration(
      uuid,
    );

    existingReconsideration.reviewDate = formatIncomingDate(updates.reviewDate);
    existingReconsideration.submittedDate = formatIncomingDate(
      updates.submittedDate,
    );

    const type = await this.fetchAndValidateType(updates.typeCode);
    existingReconsideration.type = type;

    if (existingReconsideration.type.code === '33.1') {
      existingReconsideration.isReviewApproved = null;
      existingReconsideration.reviewDate = null;
    } else {
      existingReconsideration.isReviewApproved = updates.isReviewApproved;
      // TODO clarify this
      // this.validateReviewOutcome(updates, existingReconsideration);
    }

    const recon = await this.reconsiderationRepository.save(
      existingReconsideration,
    );

    return this.getByUuid(recon.uuid);
  }

  private validateReviewOutcome(
    reconsideration: ApplicationReconsiderationUpdateDto,
    updatedReconsideration: ApplicationReconsideration,
  ) {
    if (
      reconsideration.typeCode === '33' &&
      (updatedReconsideration.isReviewApproved === null ||
        updatedReconsideration.isReviewApproved === undefined)
    ) {
      throw new ServiceValidationException(
        'Review outcome is required for reconsideration of type 33',
      );
    }
  }

  private async fetchAndValidateType(code: string) {
    const type = await this.getReconsiderationType(code);

    if (!type) {
      throw new ServiceNotFoundException(
        `Provided reconsideration type does not exist ${code}`,
      );
    }

    return type;
  }

  async delete(uuid: string) {
    const reconToDelete = await this.fetchAndValidateReconsideration(uuid);
    return this.reconsiderationRepository.softRemove([reconToDelete]);
  }

  private async fetchAndValidateReconsideration(uuid: string) {
    const recon = await this.reconsiderationRepository.findOneByOrFail({
      uuid,
    });

    if (!recon) {
      throw new ServiceNotFoundException(
        `Reconsideration with uuid ${uuid} not found`,
      );
    }

    return recon;
  }

  getByCardUuid(cardUuid: string) {
    return this.reconsiderationRepository.findOneOrFail({
      where: { cardUuid },
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  getByUuid(uuid: string) {
    return this.reconsiderationRepository.findOneOrFail({
      where: { uuid },
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  getSubtasks(subtaskType: string) {
    return this.reconsiderationRepository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              type: subtaskType,
            },
          },
        },
      },
      relations: {
        application: {
          type: true,
          decisionMeetings: true,
          localGovernment: true,
        },
        card: {
          status: true,
          board: true,
          type: true,
          subtasks: { type: true, assignee: true },
        },
      },
    });
  }

  async getCodes() {
    const codes = await this.reconsiderationTypeRepository.find({
      order: { label: 'ASC' },
    });
    return this.mapper.mapArrayAsync(
      codes,
      ApplicationReconsiderationType,
      ReconsiderationTypeDto,
    );
  }

  async getReconsiderationType(
    code: string,
  ): Promise<ApplicationReconsiderationType> {
    return this.reconsiderationTypeRepository.findOneByOrFail({
      code,
    });
  }
}
