import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { Application } from '../application/application.entity';
import { Card } from '../card/card.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(PlanningReview)
    private planningReviewRepository: Repository<PlanningReview>,
    @InjectRepository(Covenant)
    private covenantRepository: Repository<Covenant>,
    @InjectRepository(ApplicationLocalGovernment)
    private localGovernmentRepository: Repository<ApplicationLocalGovernment>,
  ) {}

  // TODO add missing relations once UI is clear
  async getApplication(fileNumber: string) {
    const application = await this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
        type: true,
      },
    });

    return application;
  }

  async getNoi(fileNumber: string) {
    const noi = await this.noiRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
      },
    });

    return noi;
  }

  async getCards(cardUuids: string[]) {
    const cards = await this.cardRepository.find({
      where: { uuid: In(cardUuids) },
    });

    return cards;
  }

  async getLocalGovernments(localGovernmentUuids: string[]) {
    const cards = await this.localGovernmentRepository.find({
      where: { uuid: In(localGovernmentUuids) },
    });

    return cards;
  }

  async getPlanningReview(fileNumber: string) {
    // TODO Do not return if the card is deleted or Archived
    const planningReview = await this.planningReviewRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: {
          board: true,
        },
        localGovernment: true,
      },
    });

    return planningReview;
  }

  async getCovenant(fileNumber: string) {
    // TODO Do not return if the card is deleted or Archived
    const covenant = await this.covenantRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: {
          board: true,
        },
        localGovernment: true,
      },
    });

    return covenant;
  }
}
