import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NoticeOfIntentParcelDto } from '../../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcel } from '../../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from '../../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';

@Controller('notice-of-intent-parcel')
export class NoticeOfIntentParcelController {
  constructor(
    private applicationParcelService: NoticeOfIntentParcelService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string) {
    const parcels = await this.applicationParcelService.fetchByFileId(
      fileNumber,
    );

    return this.mapper.mapArray(
      parcels,
      NoticeOfIntentParcel,
      NoticeOfIntentParcelDto,
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
      NoticeOfIntentParcel,
      NoticeOfIntentParcelDto,
    )[0];
  }
}
