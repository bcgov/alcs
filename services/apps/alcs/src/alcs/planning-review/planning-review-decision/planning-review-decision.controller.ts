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
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';
import {
  CreatePlanningReviewDecisionDto,
  PlanningReviewDecisionDto,
  PlanningReviewDecisionOutcomeCodeDto,
  UpdatePlanningReviewDecisionDto,
} from './planning-review-decision.dto';
import { PlanningReviewDecision } from './planning-review-decision.entity';
import { PlanningReviewDecisionService } from './planning-review-decision.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('planning-review-decision')
@UseGuards(RolesGuard)
export class PlanningReviewDecisionController {
  constructor(
    private planningReviewDecisionService: PlanningReviewDecisionService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/planning-review/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByFileNumber(
    @Param('fileNumber') fileNumber,
  ): Promise<PlanningReviewDecisionDto[]> {
    const decisions =
      await this.planningReviewDecisionService.getByFileNumber(fileNumber);

    return await this.mapper.mapArrayAsync(
      decisions,
      PlanningReviewDecision,
      PlanningReviewDecisionDto,
    );
  }

  @Get('/codes')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCodes() {
    const codes = await this.planningReviewDecisionService.fetchCodes();
    return await this.mapper.mapArrayAsync(
      codes.outcomes,
      PlanningReviewDecisionOutcomeCode,
      PlanningReviewDecisionOutcomeCodeDto,
    );
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<PlanningReviewDecisionDto> {
    const decision = await this.planningReviewDecisionService.get(uuid);

    return this.mapper.mapAsync(
      decision,
      PlanningReviewDecision,
      PlanningReviewDecisionDto,
    );
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() createDto: CreatePlanningReviewDecisionDto,
  ): Promise<PlanningReviewDecisionDto> {
    const newDecision =
      await this.planningReviewDecisionService.create(createDto);

    return this.mapper.mapAsync(
      newDecision,
      PlanningReviewDecision,
      PlanningReviewDecisionDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdatePlanningReviewDecisionDto,
  ): Promise<PlanningReviewDecisionDto> {
    const updatedDecision = await this.planningReviewDecisionService.update(
      uuid,
      updateDto,
    );

    return this.mapper.mapAsync(
      updatedDecision,
      PlanningReviewDecision,
      PlanningReviewDecisionDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return await this.planningReviewDecisionService.delete(uuid);
  }

  @Post('/:uuid/file')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(@Param('uuid') decisionUuid: string, @Req() req) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const file = req.body.file;
    await this.planningReviewDecisionService.attachDocument(
      decisionUuid,
      file,
      req.user.entity,
    );
    return {
      uploaded: true,
    };
  }

  @Patch('/:uuid/file/:documentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateDocument(
    @Param('uuid') decisionUuid: string,
    @Param('documentUuid') documentUuid: string,
    @Body() body: { fileName: string },
  ) {
    await this.planningReviewDecisionService.updateDocument(
      documentUuid,
      body.fileName,
    );
    return {
      uploaded: true,
    };
  }

  @Get('/:uuid/file/:fileUuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async getDownloadUrl(
    @Param('uuid') decisionUuid: string,
    @Param('fileUuid') documentUuid: string,
  ) {
    const downloadUrl =
      await this.planningReviewDecisionService.getDownloadUrl(documentUuid);
    return {
      url: downloadUrl,
    };
  }

  @Get('/:uuid/file/:fileUuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async getOpenUrl(
    @Param('uuid') decisionUuid: string,
    @Param('fileUuid') documentUuid: string,
  ) {
    const downloadUrl = await this.planningReviewDecisionService.getDownloadUrl(
      documentUuid,
      true,
    );
    return {
      url: downloadUrl,
    };
  }

  @Delete('/:uuid/file/:fileUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async deleteDocument(
    @Param('uuid') decisionUuid: string,
    @Param('fileUuid') documentUuid: string,
  ) {
    await this.planningReviewDecisionService.deleteDocument(documentUuid);
    return {};
  }

  @Get('next-resolution-number/:resolutionYear')
  @UserRoles(...ANY_AUTH_ROLE)
  async getNextAvailableResolutionNumber(
    @Param('resolutionYear') resolutionYear: number,
  ) {
    return this.planningReviewDecisionService.generateResolutionNumber(
      resolutionYear,
    );
  }
}
