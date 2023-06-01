import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { ApplicationService } from '../../application/application.service';
import { Board } from '../../board/board.entity';
import { CardService } from '../../card/card.service';
import { ApplicationDecisionV1Service } from '../application-decision-v1/application-decision/application-decision-v1.service';
import { ApplicationDecisionV2Service } from '../application-decision-v2/application-decision/application-decision-v2.service';
import {
  ApplicationModificationCreateDto,
  ApplicationModificationDto,
  ApplicationModificationUpdateDto,
} from './application-modification.dto';
import { ApplicationModification } from './application-modification.entity';

@Injectable()
export class ApplicationModificationService {
  constructor(
    @InjectRepository(ApplicationModification)
    private modificationRepository: Repository<ApplicationModification>,
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private applicationDecisionV1Service: ApplicationDecisionV1Service,
    private cardService: CardService,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<ApplicationModification> = {
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
    modifiesDecisions: true,
    resultingDecision: true,
    reviewOutcome: true,
  };

  getByBoardCode(boardCode: string) {
    return this.getBy({ card: { board: { code: boardCode } } });
  }

  getByApplication(applicationFileNumber: string) {
    return this.getBy({ application: { fileNumber: applicationFileNumber } });
  }

  getBy(findOptions: FindOptionsWhere<ApplicationModification>) {
    return this.modificationRepository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(applicationFileNumber: string) {
    return this.modificationRepository.find({
      where: {
        application: {
          fileNumber: applicationFileNumber,
        },
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  mapToDtos(
    modifications: ApplicationModification[],
  ): Promise<ApplicationModificationDto[]> {
    return this.mapper.mapArrayAsync(
      modifications,
      ApplicationModification,
      ApplicationModificationDto,
    );
  }

  async create(createDto: ApplicationModificationCreateDto, board: Board) {
    const modification = new ApplicationModification({
      submittedDate: new Date(createDto.submittedDate),
      isTimeExtension: createDto.isTimeExtension,
    });

    modification.card = await this.cardService.create('MODI', board, false);
    modification.application = await this.getOrCreateApplication(createDto);
    modification.modifiesDecisions =
      await this.applicationDecisionV1Service.getMany(
        createDto.modifiesDecisionUuids,
      );

    const mockModifications = await this.modificationRepository.save(
      modification,
    );
    return this.getByUuid(mockModifications.uuid);
  }

  private async getOrCreateApplication(
    createDto: ApplicationModificationCreateDto,
  ) {
    const existingApplication = await this.applicationService.get(
      createDto.applicationFileNumber,
    );

    if (existingApplication) {
      return existingApplication;
    } else {
      return await this.applicationService.create(
        {
          fileNumber: createDto.applicationFileNumber,
          typeCode: createDto.applicationTypeCode,
          regionCode: createDto.regionCode,
          localGovernmentUuid: createDto.localGovernmentUuid,
          applicant: createDto.applicant,
        },
        false,
      );
    }
  }

  async update(uuid: string, updateDto: ApplicationModificationUpdateDto) {
    const modification = await this.getByUuidOrFail(uuid);

    if (updateDto.submittedDate) {
      modification.submittedDate = new Date(updateDto.submittedDate);
    }
    if (updateDto.reviewDate !== undefined) {
      modification.reviewDate = updateDto.reviewDate
        ? new Date(updateDto.reviewDate)
        : null;
    }

    if (updateDto.reviewOutcomeCode) {
      modification.reviewOutcomeCode = updateDto.reviewOutcomeCode;
    }

    if (updateDto.isTimeExtension !== undefined) {
      modification.isTimeExtension = updateDto.isTimeExtension;
    }

    if (updateDto.modifiesDecisionUuids) {
      modification.modifiesDecisions =
        await this.applicationDecisionV1Service.getMany(
          updateDto.modifiesDecisionUuids,
        );
    }

    await this.modificationRepository.save(modification);
    return this.getByUuid(uuid);
  }

  async delete(uuid: string) {
    const modification = await this.getByUuidOrFail(uuid);
    return this.modificationRepository.softRemove([modification]);
  }

  private async getByUuidOrFail(uuid: string) {
    const modification = await this.modificationRepository.findOneBy({
      uuid,
    });

    if (!modification) {
      throw new ServiceNotFoundException(
        `Modification with uuid ${uuid} not found`,
      );
    }

    return modification;
  }

  getByCardUuid(cardUuid: string) {
    return this.getOneByOrFail({ cardUuid });
  }

  getByUuid(uuid: string) {
    return this.getOneByOrFail({ uuid });
  }

  getOneByOrFail(findOptions: FindOptionsWhere<ApplicationModification>) {
    return this.modificationRepository.findOneOrFail({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.modificationRepository.find({
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
}
