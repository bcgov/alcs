import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { CreateOrUpdateUserDto, UserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectMapper() private userMapper: Mapper,
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

  async update(user: Partial<User>) {
    const existingUser = await this.getByUuid(user.uuid);

    if (!existingUser) {
      throw new ServiceNotFoundException(`User not found ${user}`);
    }

    const updatedUser = Object.assign(existingUser, user);

    return this.userRepository.save(updatedUser);
  }
}
