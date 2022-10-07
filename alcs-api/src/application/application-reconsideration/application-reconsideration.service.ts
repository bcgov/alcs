import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Board } from '../../board/board.entity';
import { CardCreateDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { CodeService } from '../../code/code.service';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
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

    const existingApplication = await this.applicationService.get(
      reconsideration.applicationFileNumber,
    );

    // TODO: move application creation/linkage to separate function
    if (existingApplication) {
      newReconsideration.applicationUuid = existingApplication.uuid;
      // TODO: check if this is required
      // newReconsideration.application = existingApplication;
    } else {
      const applicationType = await this.codeService.fetchApplicationType(
        reconsideration.applicationTypeCode,
      );
      if (!applicationType) {
        throw new ServiceNotFoundException(
          `Provided application type does not exist ${reconsideration.applicationTypeCode}`,
        );
      }

      const applicationRegion = await this.codeService.fetchRegion(
        reconsideration.region,
      );
      if (!applicationRegion) {
        throw new ServiceNotFoundException(
          `Provided application region does not exist ${reconsideration.region}`,
        );
      }
      // if application does not exist => create it and link to reconsideration.
      // Application card must not be created
      const mappedApplication = this.mapper.map(
        reconsideration,
        ApplicationReconsiderationCreateDto,
        Application,
      );
      newReconsideration.application = new Application();
      newReconsideration.application = Object.assign(
        newReconsideration.application,
        mappedApplication,
      );
      newReconsideration.application.type = applicationType;
      newReconsideration.application.region = applicationRegion;
      newReconsideration.application.card = new Card();
    }

    return this.reconsiderationRepository.save(newReconsideration);
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
    if (
      (reconsideration.typeCode === '33' &&
        updatedReconsideration.isReviewApproved === null) ||
      updatedReconsideration.isReviewApproved === undefined
    ) {
      throw new ServiceValidationException(
        'Review outcome is required for reconsideration of type 33',
      );
    }

    return this.reconsiderationRepository.save(updatedReconsideration);
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
    return this.reconsiderationRepository.findOne({
      where: { cardUuid },
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }
}
