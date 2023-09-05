import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { LessThan, Repository } from 'typeorm';
import { Card } from '../card/card.entity';
import { User } from '../../user/user.entity';
import { CreateMessageServiceDto } from './message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async list(userUuid: string) {
    return await this.messageRepository.find({
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

    return this.messageRepository.findOne({
      where: {
        uuid,
        receiverUuid,
      },
    });
  }

  async create(messageServiceDto: CreateMessageServiceDto) {
    const notification = new Message({
      ...messageServiceDto,
    });
    await this.messageRepository.save(notification);
  }

  async markRead(uuid: string) {
    return await this.messageRepository.update(
      {
        uuid,
      },
      {
        read: true,
      },
    );
  }

  async markAllRead(receiverUuid: string) {
    return await this.messageRepository.update(
      {
        receiverUuid,
      },
      {
        read: true,
      },
    );
  }

  async cleanUp(olderThan: Date, read = true) {
    return await this.messageRepository.delete({
      createdAt: LessThan(olderThan),
      read,
    });
  }

  async createForCard(
    author: User,
    receiverUuid: string,
    body: string,
    title: string,
    card: Card,
  ) {
    const frontEnd = this.config.get('ALCS.FRONTEND_ROOT');

    if (!card || !card.board) {
      throw new Error('Cannot set notifications without proper card');
    }

    const message = new Message({
      body,
      title: title,
      link: `${frontEnd}/board/${card.board.code}?card=${card.uuid}&type=${card.type.code}`,
      targetType: 'application',
      actor: author,
      receiverUuid,
    });
    await this.messageRepository.save(message);
  }
}
