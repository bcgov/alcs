import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FindOptionsRelations, Repository } from 'typeorm';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { filterUndefined } from '../../utils/undefined';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardService } from '../card/card.service';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReviewType } from './planning-review-type.entity';
import {
  CreatePlanningReviewDto,
  PlanningReviewDto,
  UpdatePlanningReviewDto,
} from './planning-review.dto';
import { PlanningReview } from './planning-review.entity';

@Injectable()
export class PlanningReviewService {
  constructor(
    private cardService: CardService,
    @InjectRepository(PlanningReview)
    private reviewRepository: Repository<PlanningReview>,
    @InjectRepository(PlanningReviewType)
    private typeRepository: Repository<PlanningReviewType>,
    @InjectRepository(PlanningReferral)
    private referralRepository: Repository<PlanningReferral>,
    @InjectMapper() private mapper: Mapper,
    private fileNumberService: FileNumberService,
    private governmentService: LocalGovernmentService,
    private codeService: CodeService,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<PlanningReview> = {
    localGovernment: true,
    region: true,
    type: true,
  };

  async create(data: CreatePlanningReviewDto, board: Board) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();
    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: data.typeCode,
      },
    });
    const planningReview = new PlanningReview({
      type,
      localGovernmentUuid: data.localGovernmentUuid,
      fileNumber: fileNumber,
      regionCode: data.regionCode,
      documentName: data.documentName,
    });

    const savedReview = await this.reviewRepository.save(planningReview);

    const referral = new PlanningReferral({
      planningReview: savedReview,
      dueDate: formatIncomingDate(data.dueDate),
      submissionDate: formatIncomingDate(data.submissionDate)!,
      referralDescription: data.description,
      card: await this.cardService.create(CARD_TYPE.PLAN, board, false),
    });
    return await this.referralRepository.save(referral);
  }

  async getOrFail(uuid: string) {
    const planningReview = await this.get(uuid);
    if (!planningReview) {
      throw new ServiceNotFoundException(
        `Failed to find planning meeting with uuid ${uuid}`,
      );
    }

    return planningReview;
  }

  mapToDtos(planningReviews: PlanningReview[]) {
    return this.mapper.mapArrayAsync(
      planningReviews,
      PlanningReview,
      PlanningReviewDto,
    );
  }

  getByFileNumber(fileNumber: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDetailedReview(fileNumber: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: {
        ...this.DEFAULT_RELATIONS,
        referrals: {
          card: {
            board: true,
            type: true,
            subtasks: {
              type: true,
            },
          },
        },
        meetings: {
          type: true,
        },
      },
      order: {
        referrals: {
          auditCreatedAt: 'DESC',
        },
      },
    });
  }

  private get(uuid: string) {
    return this.reviewRepository.findOne({
      where: {
        uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async listTypes() {
    return this.typeRepository.find({
      order: {
        label: 'ASC',
      },
    });
  }

  async update(
    fileNumber: string,
    updateDto: UpdatePlanningReviewDto,
    user?: User,
  ) {
    const existingReview = await this.reviewRepository.findOneOrFail({
      where: {
        fileNumber,
      },
    });

    if (!updateDto.open && existingReview.open) {
      existingReview.closedDate = new Date();
      if (user) {
        existingReview.closedBy = user;
      }
    }

    if (updateDto.open && !existingReview.open) {
      existingReview.closedDate = null;
      existingReview.closedBy = null;
    }

    existingReview.open = filterUndefined(updateDto.open, existingReview.open);
    existingReview.typeCode = filterUndefined(
      updateDto.typeCode,
      existingReview.typeCode,
    );

    if (updateDto.localGovernmentUuid) {
      existingReview.localGovernment = await this.governmentService.getByUuid(
        updateDto.localGovernmentUuid,
      );
    }

    if (updateDto.regionCode) {
      existingReview.region = await this.codeService.fetchRegion(
        updateDto.regionCode,
      );
    }

    await this.reviewRepository.save(existingReview);
    return this.getDetailedReview(fileNumber);
  }

  async getFileNumber(planningReviewUuid: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        uuid: planningReviewUuid,
      },
      select: ['fileNumber'],
    });
  }
}
