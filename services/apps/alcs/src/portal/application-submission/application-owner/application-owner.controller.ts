import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { DocumentService } from '../../../document/document.service';
import { ApplicationSubmissionService } from '../application-submission.service';
import {
  APPLICATION_OWNER,
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
  SetPrimaryContactDto,
} from './application-owner.dto';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

@Controller('application-owner')
@UseGuards(PortalAuthGuard)
export class ApplicationOwnerController {
  constructor(
    private ownerService: ApplicationOwnerService,
    private applicationService: ApplicationSubmissionService,
    private documentService: DocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('application/:fileId')
  async fetchByFileId(
    @Param('fileId') fileId: string,
    @Req() req,
  ): Promise<ApplicationOwnerDto[]> {
    await this.applicationService.verifyAccess(fileId, req.user.entity);
    const owners = await this.ownerService.fetchByApplicationFileId(fileId);
    return this.mapper.mapArrayAsync(
      owners,
      ApplicationOwner,
      ApplicationOwnerDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: ApplicationOwnerCreateDto,
    @Req() req,
  ): Promise<ApplicationOwnerDto> {
    this.verifyDto(createDto);

    const application = await this.applicationService.verifyAccess(
      createDto.applicationFileNumber,
      req.user.entity,
    );
    const owner = await this.ownerService.create(createDto, application);

    return this.mapper.mapAsync(owner, ApplicationOwner, ApplicationOwnerDto);
  }

  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationOwnerUpdateDto,
    @Req() req,
  ) {
    await this.verifyAccessAndGetOwner(req, uuid);
    this.verifyDto(updateDto);

    const newParcel = await this.ownerService.update(uuid, updateDto);

    return this.mapper.mapAsync(
      newParcel,
      ApplicationOwner,
      ApplicationOwnerDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.verifyAccessAndGetOwner(req, uuid);
    return { uuid: await this.ownerService.delete(owner) };
  }

  @Post('/:uuid/link/:parcelUuid')
  async linkToParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    await this.verifyAccessAndGetOwner(req, uuid);

    return { uuid: await this.ownerService.attachToParcel(uuid, parcelUuid) };
  }

  @Post('/:uuid/unlink/:parcelUuid')
  async removeFromParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    await this.verifyAccessAndGetOwner(req, uuid);

    return { uuid: await this.ownerService.removeFromParcel(uuid, parcelUuid) };
  }

  private verifyDto(
    dto: ApplicationOwnerUpdateDto | ApplicationOwnerCreateDto,
  ) {
    if (
      dto.typeCode === APPLICATION_OWNER.INDIVIDUAL &&
      (!dto.firstName || !dto.lastName)
    ) {
      throw new BadRequestException(
        'Individuals require both first and last name',
      );
    }

    if (
      dto.typeCode === APPLICATION_OWNER.ORGANIZATION &&
      !dto.organizationName
    ) {
      throw new BadRequestException(
        'Organizations must have an organizationName',
      );
    }
  }

  @Post('setPrimaryContact')
  async setPrimaryContact(@Body() data: SetPrimaryContactDto, @Req() req) {
    const application = await this.applicationService.verifyAccess(
      data.fileNumber,
      req.user.entity,
    );

    //Create Owner
    if (!data.ownerUuid) {
      const agentOwner = await this.ownerService.create(
        {
          email: data.agentEmail,
          typeCode: APPLICATION_OWNER.AGENT,
          lastName: data.agentLastName,
          firstName: data.agentFirstName,
          phoneNumber: data.agentPhoneNumber,
          organizationName: data.agentOrganization,
          applicationFileNumber: data.fileNumber,
        },
        application,
      );
      await this.ownerService.setPrimaryContact(
        application.fileNumber,
        agentOwner,
      );
    } else if (data.ownerUuid) {
      const primaryContactOwner = await this.ownerService.getOwner(
        data.ownerUuid,
      );

      if (primaryContactOwner.type.code === APPLICATION_OWNER.AGENT) {
        //Update Fields for existing agent
        await this.ownerService.update(primaryContactOwner.uuid, {
          email: data.agentEmail,
          typeCode: APPLICATION_OWNER.AGENT,
          lastName: data.agentLastName,
          firstName: data.agentFirstName,
          phoneNumber: data.agentPhoneNumber,
          organizationName: data.agentOrganization,
        });
      } else {
        //Delete Agents if we aren't using one
        await this.ownerService.deleteAgents(application);
      }

      await this.ownerService.setPrimaryContact(
        application.fileNumber,
        primaryContactOwner,
      );
    }
  }

  @Get(':uuid/corporateSummary')
  async openCorporateSummary(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.verifyAccessAndGetOwner(req, uuid);

    if (!owner.corporateSummary) {
      throw new BadRequestException('Owner has no corporate summary');
    }

    return await this.documentService.getDownloadUrl(owner.corporateSummary);
  }

  private async verifyAccessAndGetOwner(@Req() req, ownerUuid: string) {
    const owner = await this.ownerService.getOwner(ownerUuid);
    await this.applicationService.verifyAccess(
      owner.applicationFileNumber,
      req.user.entity,
    );

    return owner;
  }
}
