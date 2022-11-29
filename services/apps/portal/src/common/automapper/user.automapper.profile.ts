import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CreateUserDto, User);
      createMap(
        mapper,
        User,
        UserDto,
        forMember(
          (ud) => ud.clientRoles,
          mapFrom((u) => u.clientRoles),
        ),
        forMember(
          (ud) => ud.bceidUserName,
          mapFrom((u) => u.bceidUserName),
        ),
      );
    };
  }
}
