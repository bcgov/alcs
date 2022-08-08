import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationCodeService } from '../../application/application-code/application-code.service';
import { ApplicationDecisionMakerDto } from '../../application/application-code/application-decision-maker/application-decision-maker.dto';
import { ApplicationDecisionMaker } from '../../application/application-code/application-decision-maker/application-decision-maker.entity';
import { ApplicationRegionDto } from '../../application/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../application/application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from '../../application/application-code/application-type/application-type.dto';
import { ApplicationType } from '../../application/application-code/application-type/application-type.entity';
import { ApplicationStatusDto } from '../../application/application-status/application-status.dto';
import { ApplicationStatus } from '../../application/application-status/application-status.entity';
import {
  ApplicationDetailedDto,
  ApplicationDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(
    @InjectMapper() mapper: Mapper,
    private codeService: ApplicationCodeService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationStatus, ApplicationStatusDto);
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, ApplicationStatusDto, ApplicationStatus);
      createMap(mapper, ApplicationDecisionMaker, ApplicationDecisionMakerDto);
      createMap(mapper, ApplicationRegion, ApplicationRegionDto);

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
        forMember(
          (ad) => ad.region,
          mapFrom((a) => (a.region ? a.region.code : undefined)),
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
        forMember(
          (ad) => ad.regionDetails,
          mapFrom((a) =>
            this.mapper.map(a.type, ApplicationRegion, ApplicationRegionDto),
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
            return await this.codeService.fetchStatus(ad.status);
          }),
        ),
        forMember(
          async (a) => a.type,
          mapFrom(async (ad) => {
            return await this.codeService.fetchType(ad.type);
          }),
        ),
        forMember(
          async (a) => a.decisionMaker,
          mapFrom(async (ad) => {
            if (ad.decisionMaker) {
              return await this.codeService.fetchDecisionMaker(
                ad.decisionMaker,
              );
            }
          }),
        ),
        forMember(
          async (a) => a.region,
          mapFrom(async (ad) => {
            if (ad.region) {
              return await this.codeService.fetchRegion(ad.region);
            }
          }),
        ),
      );
    };
  }
}
