import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Board } from '../../board/board.entity';
import { CardCreateDto } from '../../card/card.dto';
import { CardService } from '../../card/card.service';
import { CodeService } from '../../code/code.service';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationService } from '../application.service';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
  ApplicationReconsiderationWithoutApplicationDto,
} from './applicationReconsideration.dto';

@Injectable()
export class ApplicationReconsiderationService {
  constructor(
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectMapper() private mapper: Mapper,
    private codeService: CodeService,
    private applicationService: ApplicationService,
    private cardService: CardService,
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

  async getByBoardCode(boardCode: string) {
    return this.reconsiderationRepository.find({
      where: { card: { board: { code: boardCode } } },
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

    const mappedReconsideration = this.mapper.map(
      reconsideration,
      ApplicationReconsiderationCreateDto,
      ApplicationReconsideration,
    );

    const newReconsideration = Object.assign(
      new ApplicationReconsideration(),
      mappedReconsideration,
    );

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

    await this.assignApplication(reconsideration, newReconsideration);

    const recon = await this.reconsiderationRepository.save(newReconsideration);
    return this.getByUuid(recon.uuid);
  }

  private async assignApplication(
    reconsideration: ApplicationReconsiderationCreateDto,
    reconsiderationToCreate: ApplicationReconsideration,
  ) {
    const existingApplication = await this.applicationService.get(
      reconsideration.applicationFileNumber,
    );

    if (existingApplication) {
      reconsiderationToCreate.applicationUuid = existingApplication.uuid;
    } else {
      const application = await this.applicationService.create(
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
      reconsiderationToCreate.application = application;
    }
  }

  async update(
    uuid: string,
    reconsideration: ApplicationReconsiderationUpdateDto,
  ) {
    const existingReconsideration = await this.fetchAndValidateReconsideration(
      uuid,
    );

    const updatedReconsideration = Object.assign(
      existingReconsideration,
      reconsideration,
    );

    const type = await this.fetchAndValidateType(reconsideration.typeCode);
    updatedReconsideration.type = type;
    this.validateReviewOutcome(reconsideration, updatedReconsideration);
    const recon = await this.reconsiderationRepository.save(
      updatedReconsideration,
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

  private async fetchAndValidateType(code) {
    const type = await this.codeService.fetchReconsiderationType(code);

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
}
