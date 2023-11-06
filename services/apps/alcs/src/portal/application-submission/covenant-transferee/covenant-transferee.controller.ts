import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
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
import { OWNER_TYPE } from '../../../common/owner-type/owner-type.entity';
import {
  ApplicationOwnerCreateDto,
  ApplicationOwnerUpdateDto,
} from '../application-owner/application-owner.dto';
import { ApplicationSubmissionService } from '../application-submission.service';
import {
  CovenantTransfereeCreateDto,
  CovenantTransfereeDto,
  CovenantTransfereeUpdateDto,
} from './covenant-transferee.dto';
import { CovenantTransferee } from './covenant-transferee.entity';
import { CovenantTransfereeService } from './covenant-transferee.service';

@Controller('covenant-transferee')
@UseGuards(PortalAuthGuard)
export class CovenantTransfereeController {
  constructor(
    private covenantTransfereeService: CovenantTransfereeService,
    private applicationSubmissionService: ApplicationSubmissionService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
    @Req() req,
  ): Promise<CovenantTransfereeDto[]> {
    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        submissionUuid,
        req.user.entity,
      );

    const transferees =
      await this.covenantTransfereeService.fetchBySubmissionUuid(
        applicationSubmission.uuid,
      );

    return this.mapper.mapArrayAsync(
      transferees,
      CovenantTransferee,
      CovenantTransfereeDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: CovenantTransfereeCreateDto,
    @Req() req,
  ): Promise<CovenantTransfereeDto> {
    this.verifyDto(createDto);

    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        createDto.applicationSubmissionUuid,
        req.user.entity,
      );
    const owner = await this.covenantTransfereeService.create(
      createDto,
      applicationSubmission,
    );

    return this.mapper.mapAsync(
      owner,
      CovenantTransferee,
      CovenantTransfereeDto,
    );
  }

  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: CovenantTransfereeUpdateDto,
    @Req() req,
  ) {
    this.verifyDto(updateDto);

    const covenantTransferee = await this.covenantTransfereeService.update(
      uuid,
      updateDto,
      req.user.entity,
    );

    return this.mapper.mapAsync(
      covenantTransferee,
      CovenantTransferee,
      CovenantTransfereeDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.verifyAccessAndGetOwner(req, uuid);
    await this.covenantTransfereeService.delete(owner);
    return { uuid };
  }

  private verifyDto(
    dto: ApplicationOwnerUpdateDto | ApplicationOwnerCreateDto,
  ) {
    if (
      dto.typeCode === OWNER_TYPE.INDIVIDUAL &&
      (!dto.firstName || !dto.lastName)
    ) {
      throw new BadRequestException(
        'Individuals require both first and last name',
      );
    }

    if (dto.typeCode === OWNER_TYPE.ORGANIZATION && !dto.organizationName) {
      throw new BadRequestException(
        'Organizations must have an organizationName',
      );
    }
  }

  private async verifyAccessAndGetOwner(@Req() req, ownerUuid: string) {
    const owner = await this.covenantTransfereeService.getOwner(ownerUuid);
    await this.applicationSubmissionService.verifyAccessByUuid(
      owner.applicationSubmissionUuid,
      req.user.entity,
    );

    return owner;
  }
}
