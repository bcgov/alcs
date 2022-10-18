import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { Repository } from 'typeorm';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { EmailService } from '../providers/email/email.service';
import { CreateOrUpdateUserDto, UserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectMapper() private userMapper: Mapper,
    private emailService: EmailService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async getAll() {
    return this.userRepository.find();
  }

  async create(dto: CreateOrUpdateUserDto) {
    const existingUser = await this.get(dto.email);

    if (existingUser) {
      throw new Error(`Email already exists: ${dto.email}`);
    }

    const user = await this.userMapper.mapAsync(dto, UserDto, User);
    return this.userRepository.save(user);
  }

  async delete(email: string) {
    const existingUser = await this.get(email);

    if (!existingUser) {
      throw new ServiceNotFoundException(
        `User with provided email not found ${email}`,
      );
    }

    return this.userRepository.softRemove(existingUser);
  }

  async get(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
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
