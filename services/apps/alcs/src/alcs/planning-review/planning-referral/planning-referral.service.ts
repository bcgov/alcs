import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FindOptionsRelations, IsNull, Not, Repository } from 'typeorm';
import { PlanningReferralDto } from '../planning-review.dto';
import { PlanningReferral } from './planning-referral.entity';

@Injectable()
export class PlanningReferralService {
  constructor(
    @InjectRepository(PlanningReferral)
    private referralRepository: Repository<PlanningReferral>,
    @InjectMapper()
    private mapper: Mapper,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<PlanningReferral> = {
    card: {
      type: true,
      status: true,
      board: true,
    },
    planningReview: {
      localGovernment: true,
      region: true,
      type: true,
    },
  };

  async getByBoard(boardUuid: string) {
    return this.referralRepository.find({
      where: {
        card: {
          boardUuid,
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async mapToDtos(planningReferrals: PlanningReferral[]) {
    return this.mapper.mapArray(
      planningReferrals,
      PlanningReferral,
      PlanningReferralDto,
    );
  }

  get(uuid: string) {
    return this.referralRepository.findOneOrFail({
      where: {
        uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByCardUuid(uuid: string) {
    return this.referralRepository.findOneOrFail({
      where: {
        cardUuid: uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(fileNumber: string) {
    return this.referralRepository.find({
      where: {
        planningReview: {
          fileNumber: fileNumber,
        },
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });
  }
}
