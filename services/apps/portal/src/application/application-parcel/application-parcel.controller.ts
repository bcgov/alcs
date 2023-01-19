import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { ApplicationService } from '../application.service';
import {
  ApplicationParcelCreateDto,
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
} from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

@Controller('application-parcel')
@UseGuards(AuthGuard)
export class ApplicationParcelController {
  constructor(
    private parcelService: ApplicationParcelService,
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('application/:fileId')
  async fetchByFileId(
    @Param('fileId') fileId: string,
  ): Promise<ApplicationParcelDto[] | undefined> {
    const parcels = await this.parcelService.fetchByApplicationFileId(fileId);
    return this.mapper.mapArrayAsync(
      parcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: ApplicationParcelCreateDto,
  ): Promise<ApplicationParcelDto> {
    const application = await this.applicationService.getOrFail(
      createDto.applicationFileId,
    );
    const parcel = await this.parcelService.create(application.fileNumber);

    return this.mapper.mapAsync(
      parcel,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Put('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationParcelUpdateDto,
  ): Promise<ApplicationParcelDto> {
    const newParcel = await this.parcelService.update(uuid, updateDto);

    return this.mapper.mapAsync(
      newParcel,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }
}
