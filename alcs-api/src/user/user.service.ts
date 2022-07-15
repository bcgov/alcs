import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AUTH_ROLE } from '../common/enum';
import { CreateOrUpdateUserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async listUsers() {
    const users = await this.userRepository.find();
    return users.map((user) => ({ email: user.email, roles: user.roles }));
  }

  async createUser(dto: CreateOrUpdateUserDto) {
    const existingUser = await this.userRepository.find({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const validRoles = this.isValidRoles(dto.roles);
    if (!validRoles) {
      throw new Error('Provided roles do not exist');
    }

    return this.userRepository.save({
      email: dto.email,
      roles: dto.roles as AUTH_ROLE[],
    });
  }

  async deleteUser(email: string) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    return this.userRepository.softRemove(existingUser);
  }

  async getUserRoles(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return [];
    }

    return user.roles;
  }

  async setUserRoles(email: string, roles: string[]) {
    const validRoles = this.isValidRoles(roles);
    if (!validRoles) {
      throw new Error('Provided roles do not exist');
    }

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.roles = roles as AUTH_ROLE[];
    return this.userRepository.save(user);
  }

  private isValidRoles(roles: string[]) {
    return roles.reduce((result, role) => {
      return result && Object.values(AUTH_ROLE).includes(role as AUTH_ROLE);
    }, true);
  }
}
