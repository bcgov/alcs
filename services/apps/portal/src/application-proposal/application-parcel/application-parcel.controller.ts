import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { ApplicationOwnerService } from '../application-owner/application-owner.service';
import { ApplicationProposalService } from '../application-proposal.service';
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
    private applicationService: ApplicationProposalService,
    @InjectMapper() private mapper: Mapper,
    private ownerService: ApplicationOwnerService,
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
    const parcel = await this.parcelService.create(
      application.fileNumber,
      createDto.parcelType,
    );

    try {
      if (createDto.ownerUuid) {
        await this.ownerService.attachToParcel(
          createDto.ownerUuid,
          parcel.uuid,
        );
      }
    } catch (e) {
      await this.delete([parcel.uuid]);
      throw e;
    }

    return this.mapper.mapAsync(
      parcel,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Put('/')
  async update(
    @Body() updateDtos: ApplicationParcelUpdateDto[],
  ): Promise<ApplicationParcelDto[]> {
    const updatedParcels = await this.parcelService.update(updateDtos);

    return this.mapper.mapArrayAsync(
      updatedParcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Delete()
  async delete(@Body() uuids: string[]) {
    const deletedParcels = await this.parcelService.deleteMany(uuids);
    return this.mapper.mapArrayAsync(
      deletedParcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }
}
