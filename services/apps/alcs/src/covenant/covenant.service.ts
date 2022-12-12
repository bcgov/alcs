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
  Repository,
} from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { CardService } from '../card/card.service';
import { CovenantDto, CreateCovenantDto } from './covenant.dto';
import { Covenant } from './covenant.entity';

@Injectable()
export class CovenantService {
  private DEFAULT_RELATIONS: FindOptionsRelations<Covenant> = {
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
    @InjectRepository(Covenant)
    private repository: Repository<Covenant>,
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
  ) {}

  async create(data: CreateCovenantDto, board: Board) {
    const existingCovenant = await this.repository.findOne({
      where: {
        fileNumber: data.fileNumber,
      },
    });
    if (existingCovenant) {
      throw new ServiceValidationException(
        `Covenant already exists with File ID ${data.fileNumber}`,
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

    const covenant = new Covenant({
      localGovernmentUuid: data.localGovernmentUuid,
      fileNumber: data.fileNumber,
      regionCode: data.regionCode,
      applicant: data.applicant,
    });

    covenant.card = await this.cardService.create('COV', board, false);
    const savedCovenant = await this.repository.save(covenant);

    return this.getOrFail(savedCovenant.uuid);
  }

  async getOrFail(uuid: string) {
    const covenant = await this.get(uuid);
    if (!covenant) {
      throw new ServiceNotFoundException(
        `Failed to find covenant with uuid ${uuid}`,
      );
    }

    return covenant;
  }

  mapToDtos(covenants: Covenant[]) {
    return this.mapper.mapArrayAsync(covenants, Covenant, CovenantDto);
  }

  async getByCardUuid(cardUuid: string) {
    const covenant = await this.repository.findOne({
      where: { cardUuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!covenant) {
      throw new ServiceNotFoundException(
        `Failed to find covenant with card uuid ${cardUuid}`,
      );
    }

    return covenant;
  }

  getBy(findOptions: FindOptionsWhere<Covenant>) {
    return this.repository.find({
      where: findOptions,
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
}
