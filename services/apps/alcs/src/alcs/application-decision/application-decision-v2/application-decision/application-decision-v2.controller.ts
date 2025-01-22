import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../../common/authorization/roles';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { NaruSubtypeDto } from '../../../../portal/application-submission/application-submission.dto';
import { NaruSubtype } from '../../../../portal/application-submission/naru-subtype/naru-subtype.entity';
import { ApplicationService } from '../../../application/application.service';
import { ApplicationCeoCriterionCode } from '../../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../../application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypeDto } from '../../application-decision-condition/application-decision-condition.dto';
import { ApplicationDecisionMakerCode } from '../../application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerCodeDto } from '../../application-decision-maker/decision-maker.dto';
import { ApplicationDecisionOutcomeCode } from '../../application-decision-outcome.entity';
import { ApplicationDecision } from '../../application-decision.entity';
import { ApplicationModificationService } from '../../application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionV2Service } from './application-decision-v2.service';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeCodeDto,
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { CeoCriterionCodeDto } from './ceo-criterion/ceo-criterion.dto';
import { ApplicationDecisionComponentType } from './component/application-decision-component-type.entity';
import { ApplicationDecisionComponentTypeDto } from './component/application-decision-component.dto';
import { ApplicationConditionStatus } from './application-condition-status.dto';

export enum IncludeQueryParam {
  CONDITION_STATUS = 'conditionStatus',
}

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision')
@UseGuards(RolesGuard)
export class ApplicationDecisionV2Controller {
  constructor(
    private appDecisionService: ApplicationDecisionV2Service,
    private applicationService: ApplicationService,
    private modificationService: ApplicationModificationService,
    private reconsiderationService: ApplicationReconsiderationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByFileNumber(@Param('fileNumber') fileNumber: string): Promise<ApplicationDecisionDto[]> {
    const decisions = await this.appDecisionService.getByAppFileNumber(fileNumber);
    return await this.mapper.mapArrayAsync(decisions, ApplicationDecision, ApplicationDecisionDto);
  }

  @Get('/condition/:uuid/status')
  @UserRoles(...ANY_AUTH_ROLE)
  async getConditionStatus(@Param('uuid') uuid): Promise<ApplicationConditionStatus> {
    const status = await this.appDecisionService.getDecisionConditionStatus(uuid);
    return {
      uuid: uuid,
      status: status,
    };
  }

  @Get('/codes')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCodes() {
    const codes = await this.appDecisionService.fetchCodes();
    return {
      outcomes: await this.mapper.mapArrayAsync(
        codes.outcomes,
        ApplicationDecisionOutcomeCode,
        ApplicationDecisionOutcomeCodeDto,
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
      decisionComponentTypes: await this.mapper.mapArrayAsync(
        codes.decisionComponentTypes,
        ApplicationDecisionComponentType,
        ApplicationDecisionComponentTypeDto,
      ),
      decisionConditionTypes: await this.mapper.mapArrayAsync(
        codes.decisionConditionTypes,
        ApplicationDecisionConditionType,
        ApplicationDecisionConditionTypeDto,
      ),
      naruSubtypes: await this.mapper.mapArrayAsync(codes.naruSubtypes, NaruSubtype, NaruSubtypeDto),
    };
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(
    @Param('uuid') uuid: string,
    @Query('include') include?: IncludeQueryParam,
  ): Promise<ApplicationDecisionDto> {
    const decision = await this.appDecisionService.get(uuid);

    const decisionDto = await this.mapper.mapAsync(decision, ApplicationDecision, ApplicationDecisionDto);

    if (include === IncludeQueryParam.CONDITION_STATUS) {
      for (const condition of decisionDto.conditions!) {
        const status = await this.appDecisionService.getDecisionConditionStatus(condition.uuid);
        condition.status = status !== '' ? status : undefined;
      }
    }

    return decisionDto;
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(@Body() createDto: CreateApplicationDecisionDto): Promise<ApplicationDecisionDto> {
    if (createDto.modifiesUuid && createDto.reconsidersUuid) {
      throw new BadRequestException('Cannot create a Decision linked to both a modification and a reconsideration');
    }

    const application = await this.applicationService.getOrFail(createDto.applicationFileNumber);

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
      createDto.decisionToCopy,
    );

    return this.mapper.mapAsync(newDecision, ApplicationDecision, ApplicationDecisionDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateApplicationDecisionDto,
  ): Promise<ApplicationDecisionDto> {
    if (updateDto.modifiesUuid && updateDto.reconsidersUuid) {
      throw new BadRequestException('Cannot create a Decision linked to both a modification and a reconsideration');
    }

    let modifies;
    if (updateDto.modifiesUuid) {
      modifies = await this.modificationService.getByUuid(updateDto.modifiesUuid);
    } else if (updateDto.modifiesUuid === null) {
      modifies = null;
    }

    let reconsiders;
    if (updateDto.reconsidersUuid) {
      reconsiders = await this.reconsiderationService.getByUuid(updateDto.reconsidersUuid);
    } else if (updateDto.reconsidersUuid === null) {
      reconsiders = null;
    }
    const updatedDecision = await this.appDecisionService.update(uuid, updateDto, modifies, reconsiders);
    return this.mapper.mapAsync(updatedDecision, ApplicationDecision, ApplicationDecisionDto);
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
    await this.appDecisionService.attachDocument(decisionUuid, file, req.user.entity);
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
    await this.appDecisionService.updateDocument(documentUuid, body.fileName);
    return {
      uploaded: true,
    };
  }

  @Get('/:uuid/file/:fileUuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async getDownloadUrl(@Param('uuid') decisionUuid: string, @Param('fileUuid') documentUuid: string) {
    const downloadUrl = await this.appDecisionService.getDownloadUrl(documentUuid);
    return {
      url: downloadUrl,
    };
  }

  @Get('/:uuid/file/:fileUuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async getOpenUrl(@Param('uuid') decisionUuid: string, @Param('fileUuid') documentUuid: string) {
    const downloadUrl = await this.appDecisionService.getDownloadUrl(documentUuid, true);
    return {
      url: downloadUrl,
    };
  }

  @Delete('/:uuid/file/:fileUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async deleteDocument(@Param('uuid') decisionUuid: string, @Param('fileUuid') documentUuid: string) {
    await this.appDecisionService.deleteDocument(documentUuid);
    return {};
  }

  @Get('next-resolution-number/:resolutionYear')
  @UserRoles(...ANY_AUTH_ROLE)
  async getNextAvailableResolutionNumber(@Param('resolutionYear') resolutionYear: number) {
    return this.appDecisionService.generateResolutionNumber(resolutionYear);
  }
}
