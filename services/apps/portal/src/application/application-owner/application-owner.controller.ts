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
import { firstValueFrom } from 'rxjs';
import { AlcsDocumentService } from '../../alcs/document-grpc/alcs-document.service';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { AttachExternalDocumentDto } from '../application-document/application-document.dto';
import { ApplicationService } from '../application.service';
import {
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
} from './application-owner.dto';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

@Controller('application-owner')
@UseGuards(AuthGuard)
export class ApplicationOwnerController {
  constructor(
    private ownerService: ApplicationOwnerService,
    private applicationService: ApplicationService,
    private documentService: DocumentService,
    private alcsDocumentService: AlcsDocumentService,
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
      createDto.applicationFileId,
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
    this.verifyDto(updateDto);
    await this.ownerService.getByOwner(req.user.entity, uuid);

    const newParcel = await this.ownerService.update(uuid, updateDto);

    return this.mapper.mapAsync(
      newParcel,
      ApplicationOwner,
      ApplicationOwnerDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') uuid: string, @Req() req) {
    await this.ownerService.getByOwner(req.user.entity, uuid);
    return { uuid: await this.ownerService.delete(uuid) };
  }

  @Post('/:uuid/link/:parcelUuid')
  async linkToParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    await this.ownerService.getByOwner(req.user.entity, uuid);
    return { uuid: await this.ownerService.attachToParcel(uuid, parcelUuid) };
  }

  @Post('/:uuid/unlink/:parcelUuid')
  async removeFromParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    await this.ownerService.getByOwner(req.user.entity, uuid);
    return { uuid: await this.ownerService.removeFromParcel(uuid, parcelUuid) };
  }

  private verifyDto(
    dto: ApplicationOwnerUpdateDto | ApplicationOwnerCreateDto,
  ) {
    if (dto.typeCode === 'INDV' && (!dto.firstName || !dto.lastName)) {
      throw new BadRequestException(
        'Individuals require both first and last name',
      );
    }

    if (dto.typeCode === 'ORGZ' && !dto.organizationName) {
      throw new BadRequestException(
        'Organizations must have an organizationName',
      );
    }
  }

  @Post('attachExternal')
  async attachExternalDocument(
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ) {
    const alcsDocument = await firstValueFrom(
      this.alcsDocumentService.createExternalDocument({
        ...data,
      }),
    );

    const savedDocument = await this.documentService.create(
      new Document({
        fileName: data.fileName,
        fileSize: data.fileSize,
        alcsDocumentUuid: alcsDocument.alcsDocumentUuid,
        uploadedBy: req.user.entity,
      }),
    );

    return {
      uuid: savedDocument.uuid,
    };
  }

  @Get(':uuid/corporateSummary')
  async openCorporateSummary(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.ownerService.getByOwner(req.user.entity, uuid);

    if (!owner.corporateSummary) {
      throw new BadRequestException('Owner has no corporate summary');
    }

    return await firstValueFrom(
      this.documentService.getDownloadUrl(
        owner.corporateSummary.alcsDocumentUuid,
      ),
    );
  }
}
