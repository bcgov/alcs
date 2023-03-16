import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationGrpcResponse } from '../../../alcs/application-grpc/alcs-application.message.interface';
import { Application } from '../../../alcs/application/application.entity';

@Injectable()
export class AlcsApplicationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        Application,
        ApplicationGrpcResponse,
        forMember(
          (a) => a.dateSubmittedToAlc,
          mapFrom((ad) => ad.dateSubmittedToAlc?.getTime().toString()),
        ),
        forMember(
          (a) => a.regionCode,
          mapFrom((ad) => ad.region?.code),
        ),
        forMember(
          (a) => a.typeCode,
          mapFrom((ad) => ad.type.code),
        ),
      );
    };
  }
}
