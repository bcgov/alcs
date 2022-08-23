import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { LessThan, Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { User } from '../user/user.entity';
import { NotificationDto } from './notification.dto';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  async list(userUuid: string) {
    const notifications = await this.notificationRepository.find({
      where: {
        receiver: {
          uuid: userUuid,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapToDto(notifications);
  }

  async get(uuid: string, receiverUuid: string) {
    if (!receiverUuid) {
      throw new ServiceValidationException(
        `Received invalid receiver uuid ${receiverUuid}`,
      );
    }

    return this.notificationRepository.findOne({
      where: {
        uuid,
        receiverUuid,
      },
    });
  }

  async createForApplication(
    actor: User,
    receiverUuid: string,
    body: string,
    application: Application,
  ) {
    const frontEnd = this.config.get('FRONTEND_ROOT');
    const notification = new Notification({
      body,
      title: `${application.fileNumber} (${application.applicant})`,
      link: `${frontEnd}/board/${application.decisionMaker.code}?app=${application.fileNumber}`,
      targetType: 'application',
      actor,
      receiverUuid,
    });
    await this.notificationRepository.save(notification);
  }

  async markRead(uuid: string) {
    return await this.notificationRepository.update(
      {
        uuid,
      },
      {
        read: true,
      },
    );
  }

  async markAllRead(receiverUuid: string) {
    return await this.notificationRepository.update(
      {
        receiverUuid,
      },
      {
        read: true,
      },
    );
  }

  async cleanUp(olderThan: Date, read = true) {
    return await this.notificationRepository.delete({
      createdAt: LessThan(olderThan),
      read,
    });
  }

  private mapToDto(notifications: Notification[]): NotificationDto[] {
    return this.autoMapper.mapArray(
      notifications,
      Notification,
      NotificationDto,
    );
  }
}
