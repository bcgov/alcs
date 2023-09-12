import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';

const CARD_RELATIONSHIP = {
  card: {
    board: true,
  },
  localGovernment: true,
};

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(PlanningReview)
    private planningReviewRepository: Repository<PlanningReview>,
    @InjectRepository(Covenant)
    private covenantRepository: Repository<Covenant>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

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

  async getPlanningReview(fileNumber: string) {
    const planningReview = await this.planningReviewRepository.findOne({
      where: {
        fileNumber,
        card: { archived: false },
      },
      relations: CARD_RELATIONSHIP,
    });

    return planningReview;
  }

  async getCovenant(fileNumber: string) {
    const covenant = await this.covenantRepository.findOne({
      where: {
        fileNumber,
        card: { archived: false },
      },
      relations: CARD_RELATIONSHIP,
    });

    return covenant;
  }

  async getNotification(fileNumber: string) {
    const notification = await this.notificationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: CARD_RELATIONSHIP,
    });

    return notification;
  }
}
