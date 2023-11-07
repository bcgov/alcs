import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationParcelDto } from '../../../portal/application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../../portal/application-submission/application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../../../portal/application-submission/application-parcel/application-parcel.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-parcel')
export class ApplicationParcelController {
  constructor(
    private applicationParcelService: ApplicationParcelService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string) {
    const parcels =
      await this.applicationParcelService.fetchByApplicationFileId(fileNumber);

    return this.mapper.mapArray(
      parcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Post('/:uuid')
  async update(@Param('uuid') uuid: string, @Body() body: { alrArea: number }) {
    const parcels = await this.applicationParcelService.update([
      {
        uuid,
        alrArea: body.alrArea,
      },
    ]);

    return this.mapper.mapArray(
      parcels,
      ApplicationParcel,
      ApplicationParcelDto,
    )[0];
  }
}
