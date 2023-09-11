import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NotificationParcelDto } from '../../../portal/notification-submission/notification-parcel/notification-parcel.dto';
import { NotificationParcel } from '../../../portal/notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationParcelService } from '../../../portal/notification-submission/notification-parcel/notification-parcel.service';

@Controller('notification-parcel')
export class NotificationParcelController {
  constructor(
    private notificationParcelService: NotificationParcelService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string) {
    const parcels = await this.notificationParcelService.fetchByFileId(
      fileNumber,
    );

    return this.mapper.mapArray(
      parcels,
      NotificationParcel,
      NotificationParcelDto,
    );
  }
}
