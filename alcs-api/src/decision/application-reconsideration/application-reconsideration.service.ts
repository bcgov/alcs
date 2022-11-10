import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { ApplicationDecisionService } from '../application-decision/application-decision.service';
import { ApplicationService } from '../../application/application.service';
import { Board } from '../../board/board.entity';
import { CardService } from '../../card/card.service';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
  ReconsiderationTypeDto,
} from './application-reconsideration.dto';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

@Injectable()
export class ApplicationReconsiderationService {
  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectRepository(ApplicationReconsiderationType)
    private reconsiderationTypeRepository: Repository<ApplicationReconsiderationType>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private applicationDecisionService: ApplicationDecisionService,
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
      reconsidersDecisions: true,
      resultingDecision: true,
    };

  getByBoardCode(boardCode: string) {
    return this.getBy({ card: { board: { code: boardCode } } });
  }

  getByApplication(applicationFileNumber: string) {
    return this.getBy({ application: { fileNumber: applicationFileNumber } });
  }

  getBy(findOptions: FindOptionsWhere<ApplicationReconsideration>) {
    return this.reconsiderationRepository.find({
      where: findOptions,
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  mapToDtos(
    reconsiderations: ApplicationReconsideration[],
  ): Promise<ApplicationReconsiderationDto[]> {
    return this.mapper.mapArrayAsync(
      reconsiderations,
      ApplicationReconsideration,
      ApplicationReconsiderationDto,
    );
  }

  async create(createDto: ApplicationReconsiderationCreateDto, board: Board) {
    const type = await this.getReconsiderationType(createDto.reconTypeCode);

    const reconsideration = new ApplicationReconsideration({
      submittedDate: new Date(createDto.submittedDate),
      type,
    });

    reconsideration.card = await this.cardService.create('RECON', board, false);

    reconsideration.application = await this.getOrCreateApplication(createDto);

    reconsideration.reconsidersDecisions =
      await this.applicationDecisionService.getMany(
        createDto.reconsideredDecisionUuids,
      );

    const recon = await this.reconsiderationRepository.save(reconsideration);
    return this.getByUuid(recon.uuid);
  }

  private async getOrCreateApplication(
    createDto: ApplicationReconsiderationCreateDto,
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

  async update(uuid: string, updateDto: ApplicationReconsiderationUpdateDto) {
    const reconsideration = await this.fetchAndValidateReconsideration(uuid);

    reconsideration.reviewDate = formatIncomingDate(updateDto.reviewDate);
    reconsideration.submittedDate = formatIncomingDate(updateDto.submittedDate);

    reconsideration.type = await this.getReconsiderationType(
      updateDto.typeCode,
    );

    if (updateDto.reconsideredDecisionUuids) {
      reconsideration.reconsidersDecisions =
        await this.applicationDecisionService.getMany(
          updateDto.reconsideredDecisionUuids,
        );
    }

    if (reconsideration.type.code === '33.1') {
      reconsideration.isReviewApproved = null;
      reconsideration.reviewDate = null;
    } else {
      reconsideration.isReviewApproved = updateDto.isReviewApproved;
    }

    const recon = await this.reconsiderationRepository.save(reconsideration);

    return this.getByUuid(recon.uuid);
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
    return this.getOneByOrFail({ cardUuid });
  }

  getByUuid(uuid: string) {
    return this.getOneByOrFail({ uuid });
  }

  getOneByOrFail(findOptions: FindOptionsWhere<ApplicationReconsideration>) {
    return this.reconsiderationRepository.findOneOrFail({
      where: findOptions,
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.reconsiderationRepository.find({
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
