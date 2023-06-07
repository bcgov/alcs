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
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../../common/authorization/roles';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ApplicationService } from '../../../application/application.service';
import { ApplicationDecisionOutcomeCode } from '../../application-decision-outcome.entity';
import { ApplicationDecision } from '../../application-decision.entity';
import { ApplicationModificationService } from '../../application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-reconsideration/application-reconsideration.service';
import { ApplicationCeoCriterionCode } from '../../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionMakerCode } from '../../application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionV1Service } from './application-decision-v1.service';
import {
  ApplicationDecisionDto,
  CreateApplicationDecisionDto,
  DecisionOutcomeCodeDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { CeoCriterionCodeDto } from './ceo-criterion/ceo-criterion.dto';
import { ApplicationDecisionMakerCodeDto } from '../../application-decision-maker/decision-maker.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision')
@UseGuards(RolesGuard)
export class ApplicationDecisionV1Controller {
  constructor(
    private appDecisionService: ApplicationDecisionV1Service,
    private applicationService: ApplicationService,
    private modificationService: ApplicationModificationService,
    private reconsiderationService: ApplicationReconsiderationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByFileNumber(
    @Param('fileNumber') fileNumber,
  ): Promise<ApplicationDecisionDto[]> {
    const decisions = await this.appDecisionService.getByAppFileNumber(
      fileNumber,
    );
    return await this.mapper.mapArrayAsync(
      decisions,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Get('/codes')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCodes() {
    const codes = await this.appDecisionService.fetchCodes();
    return {
      outcomes: await this.mapper.mapArrayAsync(
        codes.outcomes,
        ApplicationDecisionOutcomeCode,
        DecisionOutcomeCodeDto,
      ),
      decisionMakers: await this.mapper.mapArrayAsync(
        codes.decisionMakers,
        ApplicationDecisionMakerCode,
        ApplicationDecisionMakerCodeDto,
      ),
      ceoCriterion: await this.mapper.mapArrayAsync(
        codes.ceoCriterion,
        ApplicationCeoCriterionCode,
        CeoCriterionCodeDto,
      ),
    };
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<ApplicationDecisionDto> {
    const meeting = await this.appDecisionService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() createDto: CreateApplicationDecisionDto,
  ): Promise<ApplicationDecisionDto> {
    if (createDto.modifiesUuid && createDto.reconsidersUuid) {
      throw new BadRequestException(
        'Cannot create a Decision linked to both a modification and a reconsideration',
      );
    }

    const application = await this.applicationService.getOrFail(
      createDto.applicationFileNumber,
    );

    const modification = createDto.modifiesUuid
      ? await this.modificationService.getByUuid(createDto.modifiesUuid)
      : undefined;

    const reconsiders = createDto.reconsidersUuid
      ? await this.reconsiderationService.getByUuid(createDto.reconsidersUuid)
      : undefined;

    const newDecision = await this.appDecisionService.create(
      createDto,
      application,
      modification,
      reconsiders,
    );

    return this.mapper.mapAsync(
      newDecision,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateApplicationDecisionDto,
  ): Promise<ApplicationDecisionDto> {
    if (updateDto.modifiesUuid && updateDto.reconsidersUuid) {
      throw new BadRequestException(
        'Cannot create a Decision linked to both a modification and a reconsideration',
      );
    }

    let modifies;
    if (updateDto.modifiesUuid) {
      modifies = await this.modificationService.getByUuid(
        updateDto.modifiesUuid,
      );
    } else if (updateDto.modifiesUuid === null) {
      modifies = null;
    }

    let reconsiders;
    if (updateDto.reconsidersUuid) {
      reconsiders = await this.reconsiderationService.getByUuid(
        updateDto.reconsidersUuid,
      );
    } else if (updateDto.reconsidersUuid === null) {
      reconsiders = null;
    }

    const updatedMeeting = await this.appDecisionService.update(
      uuid,
      updateDto,
      modifies,
      reconsiders,
    );
    return this.mapper.mapAsync(
      updatedMeeting,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return await this.appDecisionService.delete(uuid);
  }

  @Post('/:uuid/file')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(@Param('uuid') decisionUuid: string, @Req() req) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const file = req.body.file;
    await this.appDecisionService.attachDocument(
      decisionUuid,
      file,
      req.user.entity,
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
    const downloadUrl = await this.appDecisionService.getDownloadUrl(
      documentUuid,
    );
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
    const downloadUrl = await this.appDecisionService.getDownloadUrl(
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
    await this.appDecisionService.deleteDocument(documentUuid);
    return {};
  }
}
