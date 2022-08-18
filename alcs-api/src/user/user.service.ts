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

  async listUsers() {
    return this.userRepository.find();
  }

  async createUser(dto: CreateOrUpdateUserDto) {
    const existingUser = await this.getUser(dto.email);

    if (existingUser) {
      throw new Error(`Email already exists: ${dto.email}`);
    }

    const user = await this.userMapper.mapAsync(dto, UserDto, User);
    return this.userRepository.save(user);
  }

  async deleteUser(email: string) {
    const existingUser = await this.getUser(email);

    if (!existingUser) {
      throw new ServiceNotFoundException(
        `User with provided email not found ${email}`,
      );
    }

    return this.userRepository.softRemove(existingUser);
  }

  async getUser(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getUserByUuid(uuid: string) {
    return await this.userRepository.findOne({
      where: {
        uuid,
      },
    });
  }

  async update(user: Partial<User>) {
    const existingUser = await this.getUserByUuid(user.uuid);

    if (!existingUser) {
      throw new ServiceNotFoundException(`User not found ${user}`);
    }

    const updatedUser = Object.assign(existingUser, user);

    return this.userRepository.save(updatedUser);
  }
}
