import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  AssigneeDto,
  CreateUserDto,
  UpdateUserDto,
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
      createMap(mapper, UserSettingsDto, UserSettings);
      createMap(mapper, UserSettings, UserSettingsDto);
      createMap(mapper, CreateUserDto, User);
      createMap(
        mapper,
        User,
        UserDto,
        forMember(
          (ud) => ud.initials,
          mapFrom((u) => {
            if (u.givenName && u.familyName) {
              return (
                u.givenName?.charAt(0).toUpperCase() +
                u.familyName?.charAt(0).toUpperCase()
              );
            }
            return u.name.charAt(0);
          }),
        ),
        forMember(
          (ud) => ud.mentionLabel,
          mapFrom((u) => {
            if (u.givenName && u.familyName) {
              return (
                u.givenName?.charAt(0).toUpperCase() +
                u.givenName?.slice(1) +
                u.familyName?.charAt(0).toUpperCase() +
                u.familyName?.slice(1)
              );
            } else {
              //TODO: how do mentions work for bceid users?
              return '';
            }
          }),
        ),
        forMember(
          (ud) => ud.clientRoles,
          mapFrom((u) => u.clientRoles),
        ),
        forMember(
          (ud) => ud.settings,
          mapFrom((u) => u.settings),
        ),
      );

      createMap(
        mapper,
        User,
        AssigneeDto,
        forMember(
          (ud) => ud.initials,
          mapFrom((u) => {
            if (u.givenName && u.familyName) {
              return (
                u.givenName?.charAt(0).toUpperCase() +
                u.familyName?.charAt(0).toUpperCase()
              );
            }
            return u.name.charAt(0);
          }),
        ),
      );
    };
  }
}
