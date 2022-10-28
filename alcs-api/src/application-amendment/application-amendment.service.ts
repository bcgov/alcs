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
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { formatIncomingDate } from '../utils/incoming-date.formatter';
import {
  ApplicationAmendmentCreateDto,
  ApplicationAmendmentDto,
  ApplicationAmendmentUpdateDto,
} from './application-amendment.dto';
import { ApplicationAmendment } from './application-amendment.entity';

@Injectable()
export class ApplicationAmendmentService {
  constructor(
    @InjectRepository(ApplicationAmendment)
    private amendmentRepository: Repository<ApplicationAmendment>,
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private cardService: CardService,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<ApplicationAmendment> = {
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
  };

  getByBoardCode(boardCode: string) {
    return this.getBy({ card: { board: { code: boardCode } } });
  }

  getByApplication(applicationFileNumber: string) {
    return this.getBy({ application: { fileNumber: applicationFileNumber } });
  }

  getBy(findOptions: FindOptionsWhere<ApplicationAmendment>) {
    return this.amendmentRepository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  mapToDtos(
    amendments: ApplicationAmendment[],
  ): Promise<ApplicationAmendmentDto[]> {
    return this.mapper.mapArrayAsync(
      amendments,
      ApplicationAmendment,
      ApplicationAmendmentDto,
    );
  }

  async create(createDto: ApplicationAmendmentCreateDto, board: Board) {
    const amendment = new ApplicationAmendment({
      submittedDate: new Date(createDto.submittedDate),
      isTimeExtension: createDto.isTimeExtension,
    });

    amendment.card = await this.cardService.create('AMEND', board, false);
    amendment.application = await this.getOrCreateApplication(createDto);

    const savedAmendment = await this.amendmentRepository.save(amendment);
    return this.getByUuid(savedAmendment.uuid);
  }

  private async getOrCreateApplication(
    createDto: ApplicationAmendmentCreateDto,
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

  async update(uuid: string, updateDto: ApplicationAmendmentUpdateDto) {
    const existingAmendment = await this.getByUuidOrFail(uuid);

    existingAmendment.reviewDate = formatIncomingDate(updateDto.reviewDate);
    existingAmendment.submittedDate = formatIncomingDate(
      updateDto.submittedDate,
    );
    existingAmendment.isReviewApproved = updateDto.isReviewApproved;
    existingAmendment.isTimeExtension = updateDto.isTimeExtension;

    const amendment = await this.amendmentRepository.save(existingAmendment);

    return this.getByUuid(amendment.uuid);
  }

  async delete(uuid: string) {
    const amendment = await this.getByUuidOrFail(uuid);
    return this.amendmentRepository.softRemove([amendment]);
  }

  private async getByUuidOrFail(uuid: string) {
    const amendment = await this.amendmentRepository.findOneBy({
      uuid,
    });

    if (!amendment) {
      throw new ServiceNotFoundException(
        `Amendment with uuid ${uuid} not found`,
      );
    }

    return amendment;
  }

  getByCardUuid(cardUuid: string) {
    return this.getOneByOrFail({ cardUuid });
  }

  getByUuid(uuid: string) {
    return this.getOneByOrFail({ uuid });
  }

  getOneByOrFail(findOptions: FindOptionsWhere<ApplicationAmendment>) {
    return this.amendmentRepository.findOneOrFail({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.amendmentRepository.find({
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
}
