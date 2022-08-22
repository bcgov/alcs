import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  CreateOrUpdateUserDto,
  UserDto,
  UserSettingsDto,
} from '../../user/user.dto';
import { User, UserSettings } from '../../user/user.entity';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CreateOrUpdateUserDto, User);
      createMap(mapper, UserSettingsDto, UserSettings);
      createMap(mapper, UserSettings, UserSettingsDto);
      createMap(mapper, UserDto, User);
      createMap(
        mapper,
        User,
        UserDto,
        forMember(
          (ud) => ud.initials,
          mapFrom(
            (u) =>
              u.givenName?.charAt(0).toUpperCase() +
              u.familyName?.charAt(0).toUpperCase(),
          ),
        ),
        forMember(
          (ud) => ud.mentionLabel,
          mapFrom(
            (u) =>
              u.givenName.charAt(0).toUpperCase() +
              u.givenName.slice(1) +
              u.familyName.charAt(0).toUpperCase() +
              u.familyName.slice(1),
          ),
        ),
      );
    };
  }
}
