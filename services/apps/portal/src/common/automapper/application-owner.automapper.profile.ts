import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationOwnerType } from '../../application/application-owner/application-owner-type/application-owner-type.entity';
import {
  ApplicationOwnerDto,
  ApplicationOwnerTypeDto,
} from '../../application/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../application/application-owner/application-owner.entity';

@Injectable()
export class ApplicationOwnerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationOwner,
        ApplicationOwnerDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) =>
            p.firstName ? `${p.firstName} ${p.lastName}` : p.organizationName,
          ),
        ),
      );

      createMap(mapper, ApplicationOwnerType, ApplicationOwnerTypeDto);
    };
  }
}
