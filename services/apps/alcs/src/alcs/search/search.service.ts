import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { Inquiry } from '../inquiry/inquiry.entity';
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
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(PlanningReview)
    private planningReviewRepository: Repository<PlanningReview>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async getApplication(fileNumber: string) {
    return await this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
        type: true,
      },
    });
  }

  async getNoi(fileNumber: string) {
    return await this.noiRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
      },
    });
  }

  async getNotification(fileNumber: string) {
    return await this.notificationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: CARD_RELATIONSHIP,
    });
  }

  async getPlanningReview(fileNumber: string) {
    return await this.planningReviewRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        localGovernment: true,
      },
    });
  }

  async getInquiry(fileNumber: string) {
    return await this.inquiryRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        localGovernment: true,
      },
    });
  }
}
