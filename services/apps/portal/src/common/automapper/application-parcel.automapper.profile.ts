import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationParcelDto } from '../../application/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../application/application-parcel/application-parcel.entity';

@Injectable()
export class ApplicationParcelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationParcel,
        ApplicationParcelDto,
        forMember(
          (pd) => pd.ownershipTypeCode,
          mapFrom((p) => p.ownershipTypeCode),
        ),
      );
    };
  }
}
