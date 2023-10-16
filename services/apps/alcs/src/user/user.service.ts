import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../alcs/local-government/local-government.entity';
import { EmailService } from '../providers/email/email.service';
import { CreateUserDto } from './user.dto';
import { User } from './user.entity';

export type UserGuids = {
  bceidGuid?: string;
  idirUserGuid?: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectMapper() private userMapper: Mapper,
    private emailService: EmailService,
    @InjectRepository(LocalGovernment)
    private localGovernmentRepository: Repository<LocalGovernment>,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async getAssignableUsers() {
    return this.userRepository.find({
      where: {
        identityProvider: 'idir',
      },
    });
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.getByGuid(dto);

    if (existingUser) {
      throw new Error(`User already exists in the system`);
    }

    const user = await this.userMapper.mapAsync(dto, CreateUserDto, User);
    return this.userRepository.save(user);
  }

  async delete(uuid: string) {
    const existingUser = await this.getByUuid(uuid);

    if (!existingUser) {
      throw new ServiceNotFoundException(
        `User with provided uuid ${uuid} was not found`,
      );
    }

    return this.userRepository.softRemove(existingUser);
  }

  async getByGuid({ bceidGuid, idirUserGuid }: UserGuids) {
    if (!bceidGuid && !idirUserGuid) {
      throw new Error('Need to pass either bceidGuid or idirUserGuid');
    }

    return await this.userRepository.findOne({
      where: {
        bceidGuid,
        idirUserGuid,
      },
    });
  }

  async getByUuid(uuid: string) {
    return await this.userRepository.findOne({
      where: {
        uuid,
      },
    });
  }

  async update(uuid: string, updates: Partial<User>) {
    const existingUser = await this.getByUuid(uuid);

    if (!existingUser) {
      throw new ServiceNotFoundException(`User not found ${uuid}`);
    }

    const updatedUser = Object.assign(existingUser, updates);
    return this.userRepository.save(updatedUser);
  }

  async getUserLocalGovernment(user: User) {
    if (user.bceidBusinessGuid) {
      return await this.localGovernmentRepository.findOne({
        where: { bceidBusinessGuid: user.bceidBusinessGuid },
        select: {
          uuid: true,
          name: true,
          isFirstNation: true,
        },
      });
    }
    return null;
  }

  async sendNewUserRequestEmail(email: string, userIdentifier: string) {
    const env = this.config.get('ENV');
    const prefix = env === 'production' ? '' : `[${env}]`;
    const subject = `${prefix} Access Requested to ALCS`;
    const body = `A new user ${email}: ${userIdentifier} has requested access to ALCS.<br/> 
<a href='https://bcgov.github.io/sso-requests/my-dashboard/integrations'>CSS</a>`;

    await this.emailService.sendEmail({
      to: this.config.get('EMAIL.DEFAULT_ADMINS'),
      body,
      subject,
    });
  }
}
