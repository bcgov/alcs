import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { Repository } from 'typeorm';
import { CreateUserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectMapper() private userMapper: Mapper,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.getByGuid(dto.bceidGuid);

    if (existingUser) {
      throw new Error(`User already exists in the system`);
    }

    const user = await this.userMapper.mapAsync(dto, CreateUserDto, User);
    return this.userRepository.save(user);
  }

  async getByGuid(bceidGuid: string) {
    return await this.userRepository.findOne({
      where: {
        bceidGuid,
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
}
