import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../../alcs/application/application.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { Notification } from '../../../alcs/notification/notification.entity';

@Injectable()
export class PublicSearchService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getApplication(fileNumber: string) {
    return await this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
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
        localGovernment: true,
      },
    });
  }

  async getNotification(fileNumber: string) {
    return await this.notificationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        localGovernment: true,
      },
    });
  }
}
