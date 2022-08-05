import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDecisionMakerDto } from '../../application/application-decision-maker/application-decision-maker.dto';
import { ApplicationDecisionMaker } from '../../application/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerService } from '../../application/application-decision-maker/application-decision-maker.service';
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
    private applicationDecisionMakerService: ApplicationDecisionMakerService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationStatus, ApplicationStatusDto);
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, ApplicationStatusDto, ApplicationStatus);
      createMap(mapper, ApplicationDecisionMaker, ApplicationDecisionMakerDto);

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
        forMember(
          (ad) => ad.decisionMaker,
          mapFrom((a) => (a.decisionMaker ? a.decisionMaker.code : undefined)),
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
        forMember(
          (ad) => ad.decisionMakerDetails,
          mapFrom((a) =>
            this.mapper.map(
              a.type,
              ApplicationDecisionMaker,
              ApplicationDecisionMakerDto,
            ),
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
            return await this.applicationTypeService.get(ad.type);
          }),
        ),
        forMember(
          async (a) => a.decisionMaker,
          mapFrom(async (ad) => {
            if (ad.decisionMaker) {
              return await this.applicationDecisionMakerService.get(
                ad.decisionMaker,
              );
            }
          }),
        ),
      );
    };
  }
}
