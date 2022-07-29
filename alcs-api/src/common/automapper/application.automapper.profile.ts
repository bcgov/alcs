import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationStatusDto } from '../../application/application-status/application-status.dto';
import { ApplicationStatus } from '../../application/application-status/application-status.entity';
import { ApplicationStatusService } from '../../application/application-status/application-status.service';
import { ApplicationTypeDto } from '../../application/application-type/application-type.dto';
import { ApplicationType } from '../../application/application-type/application-type.entity';
import { ApplicationTypeService } from '../../application/application-type/application-type.service';
import {
  ApplicationDetailedDto,
  ApplicationDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(
    @InjectMapper() mapper: Mapper,
    private applicationStatusService: ApplicationStatusService,
    private applicationTypeService: ApplicationTypeService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationStatus, ApplicationStatusDto);
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, ApplicationStatusDto, ApplicationStatus);

      createMap(
        mapper,
        Application,
        ApplicationDto,
        forMember(
          (ad) => ad.status,
          mapFrom((a) => a.status.code),
        ),
        forMember(
          (ad) => ad.type,
          mapFrom((a) => a.type.code),
        ),
      );

      createMap(
        mapper,
        Application,
        ApplicationDetailedDto,
        forMember(
          (ad) => ad.statusDetails,
          mapFrom((a) =>
            this.mapper.map(a.status, ApplicationStatus, ApplicationStatusDto),
          ),
        ),
        forMember(
          (ad) => ad.typeDetails,
          mapFrom((a) =>
            this.mapper.map(a.type, ApplicationType, ApplicationTypeDto),
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDto,
        Application,
        forMember(
          async (a) => a.status,
          mapFrom(async (ad) => {
            return await this.applicationStatusService.fetchStatus(ad.status);
          }),
        ),
        forMember(
          async (a) => a.type,
          mapFrom(async (ad) => {
            return await this.applicationTypeService.get(ad.status);
          }),
        ),
      );
    };
  }
}
