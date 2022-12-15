import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { LessThan, Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { User } from '../user/user.entity';
import { CreateNotificationServiceDto } from './notification.dto';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async list(userUuid: string) {
    return await this.notificationRepository.find({
      where: {
        receiver: {
          uuid: userUuid,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
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
    const frontEnd = this.config.get('ALCS.FRONTEND_ROOT');

    if (!application.card) {
      throw new Error(
        'Cannot set notifications for applications without cards',
      );
    }

    const notification = new Notification({
      body,
      title: `${application.fileNumber} (${application.applicant})`,
      link: `${frontEnd}/board/${application.card.board.code}?card=${application.card.uuid}&type=${application.card.type.code}`,
      targetType: 'application',
      actor,
      receiverUuid,
    });
    await this.notificationRepository.save(notification);
  }

  async createNotificationForApplication(
    notificationDto: CreateNotificationServiceDto,
  ) {
    const notification = new Notification({
      ...notificationDto,
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
}
