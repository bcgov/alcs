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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionComponentType } from '../notice-of-intent-decision-component/notice-of-intent-decision-component-type.entity';
import { NoticeOfIntentDecisionComponentTypeDto } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionConditionType } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionTypeDto } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionOutcome } from '../notice-of-intent-decision-outcome.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
  UpdateNoticeOfIntentDecisionDto,
} from '../notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentModificationService } from '../notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionV2Service } from './notice-of-intent-decision-v2.service';
import { NoticeOfIntentConditionStatus } from './notice-of-intent-condition-status.dto';

export enum IncludeQueryParam {
  CONDITION_STATUS = 'conditionStatus',
}

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent-decision/v2')
@UseGuards(RolesGuard)
export class NoticeOfIntentDecisionV2Controller {
  constructor(
    private noticeOfIntentDecisionV2Service: NoticeOfIntentDecisionV2Service,
    private noticeOfIntentService: NoticeOfIntentService,
    private modificationService: NoticeOfIntentModificationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/notice-of-intent/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByFileNumber(@Param('fileNumber') fileNumber): Promise<NoticeOfIntentDecisionDto[]> {
    const decisions = await this.noticeOfIntentDecisionV2Service.getByFileNumber(fileNumber);

    return await this.mapper.mapArrayAsync(decisions, NoticeOfIntentDecision, NoticeOfIntentDecisionDto);
  }

  @Get('/condition/:uuid/status')
  @UserRoles(...ANY_AUTH_ROLE)
  async getConditionStatus(@Param('uuid') uuid): Promise<NoticeOfIntentConditionStatus> {
    const status = await this.noticeOfIntentDecisionV2Service.getDecisionConditionStatus(uuid);
    return {
      uuid: uuid,
      status: status,
    };
  }

  @Get('/codes')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCodes() {
    const codes = await this.noticeOfIntentDecisionV2Service.fetchCodes();
    return {
      outcomes: await this.mapper.mapArrayAsync(
        codes.outcomes,
        NoticeOfIntentDecisionOutcome,
        NoticeOfIntentDecisionOutcomeCodeDto,
      ),
      decisionComponentTypes: await this.mapper.mapArrayAsync(
        codes.decisionComponentTypes,
        NoticeOfIntentDecisionComponentType,
        NoticeOfIntentDecisionComponentTypeDto,
      ),
      decisionConditionTypes: await this.mapper.mapArrayAsync(
        codes.decisionConditionTypes,
        NoticeOfIntentDecisionConditionType,
        NoticeOfIntentDecisionConditionTypeDto,
      ),
    };
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(
    @Param('uuid') uuid: string,
    @Query('include') include?: IncludeQueryParam,
  ): Promise<NoticeOfIntentDecisionDto> {
    const decision = await this.noticeOfIntentDecisionV2Service.get(uuid);

    const decisionDto = await this.mapper.mapAsync(decision, NoticeOfIntentDecision, NoticeOfIntentDecisionDto);

    if (include === IncludeQueryParam.CONDITION_STATUS) {
      for (const condition of decisionDto.conditions!) {
        const status = await this.noticeOfIntentDecisionV2Service.getDecisionConditionStatus(condition.uuid);
        condition.status = status !== '' ? status : undefined;
      }
    }

    return decisionDto;
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(@Body() createDto: CreateNoticeOfIntentDecisionDto): Promise<NoticeOfIntentDecisionDto> {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(createDto.fileNumber);

    const modification = createDto.modifiesUuid
      ? await this.modificationService.getByUuid(createDto.modifiesUuid)
      : undefined;

    const newDecision = await this.noticeOfIntentDecisionV2Service.create(createDto, noticeOfIntent, modification);

    return this.mapper.mapAsync(newDecision, NoticeOfIntentDecision, NoticeOfIntentDecisionDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateNoticeOfIntentDecisionDto,
  ): Promise<NoticeOfIntentDecisionDto> {
    let modifies;
    if (updateDto.modifiesUuid) {
      modifies = await this.modificationService.getByUuid(updateDto.modifiesUuid);
    } else if (updateDto.modifiesUuid === null) {
      modifies = null;
    }

    const updatedDecision = await this.noticeOfIntentDecisionV2Service.update(uuid, updateDto, modifies);

    return this.mapper.mapAsync(updatedDecision, NoticeOfIntentDecision, NoticeOfIntentDecisionDto);
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return await this.noticeOfIntentDecisionV2Service.delete(uuid);
  }

  @Post('/:uuid/file')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(@Param('uuid') decisionUuid: string, @Req() req) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const file = req.body.file;
    await this.noticeOfIntentDecisionV2Service.attachDocument(decisionUuid, file, req.user.entity);
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
    await this.noticeOfIntentDecisionV2Service.updateDocument(documentUuid, body.fileName);
    return {
      uploaded: true,
    };
  }

  @Get('/:uuid/file/:fileUuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async getDownloadUrl(@Param('uuid') decisionUuid: string, @Param('fileUuid') documentUuid: string) {
    const downloadUrl = await this.noticeOfIntentDecisionV2Service.getDownloadUrl(documentUuid);
    return {
      url: downloadUrl,
    };
  }

  @Get('/:uuid/file/:fileUuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async getOpenUrl(@Param('uuid') decisionUuid: string, @Param('fileUuid') documentUuid: string) {
    const downloadUrl = await this.noticeOfIntentDecisionV2Service.getDownloadUrl(documentUuid, true);
    return {
      url: downloadUrl,
    };
  }

  @Delete('/:uuid/file/:fileUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async deleteDocument(@Param('uuid') decisionUuid: string, @Param('fileUuid') documentUuid: string) {
    await this.noticeOfIntentDecisionV2Service.deleteDocument(documentUuid);
    return {};
  }

  @Get('next-resolution-number/:resolutionYear')
  @UserRoles(...ANY_AUTH_ROLE)
  async getNextAvailableResolutionNumber(@Param('resolutionYear') resolutionYear: number) {
    return this.noticeOfIntentDecisionV2Service.generateResolutionNumber(resolutionYear);
  }

  @Get('resolution-number-exists/:resolutionYear/:resolutionNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async resolutionNumberExists(
    @Param('resolutionYear') resolutionYear: number,
    @Param('resolutionNumber') resolutionNumber: number,
  ): Promise<boolean> {
    return this.noticeOfIntentDecisionV2Service.resolutionNumberExists(resolutionYear, resolutionNumber);
  }
}
