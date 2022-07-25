import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return users.map((user) => ({
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      identityProvider: user.identityProvider,
      preferredUsername: user.preferredUsername,
      givenName: user.givenName,
      familyName: user.familyName,
      idirUserGuid: user.idirUserGuid,
      idirUserName: user.idirUserName,
    }));
  }

  async createUser(dto: CreateOrUpdateUserDto) {
    const existingUser = await this.getUser(dto.email);

    if (existingUser) {
      throw new Error(`Email already exists: ${dto.email}`);
    }

    // TODO: automapper
    const user = new User();
    user.email = dto.email;
    user.name = dto.name;
    user.displayName = dto.displayName;
    user.identityProvider = dto.identityProvider;
    user.preferredUsername = dto.preferredUsername;
    user.givenName = dto.givenName;
    user.familyName = dto.familyName;
    user.idirUserGuid = dto.idirUserGuid;
    user.idirUserName = dto.idirUserName;

    return this.userRepository.save(user);
  }

  async deleteUser(email: string) {
    const existingUser = await this.getUser(email);

    if (!existingUser) {
      throw new Error('User not found');
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
}
