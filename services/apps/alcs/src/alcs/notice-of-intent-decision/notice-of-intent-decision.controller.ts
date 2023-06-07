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
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';
import { NoticeOfIntentDecision } from './notice-of-intent-decision.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeDto,
  UpdateNoticeOfIntentDecisionDto,
} from './notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from './notice-of-intent-decision.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent-decision')
@UseGuards(RolesGuard)
export class NoticeOfIntentDecisionController {
  constructor(
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionService,
    private noticeOfIntentService: NoticeOfIntentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/notice-of-intent/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByFileNumber(
    @Param('fileNumber') fileNumber,
  ): Promise<NoticeOfIntentDecisionDto[]> {
    const decisions = await this.noticeOfIntentDecisionService.getByFileNumber(
      fileNumber,
    );
    return await this.mapper.mapArrayAsync(
      decisions,
      NoticeOfIntentDecision,
      NoticeOfIntentDecisionDto,
    );
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<NoticeOfIntentDecisionDto> {
    const meeting = await this.noticeOfIntentDecisionService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      NoticeOfIntentDecision,
      NoticeOfIntentDecisionDto,
    );
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() createDto: CreateNoticeOfIntentDecisionDto,
  ): Promise<NoticeOfIntentDecisionDto> {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      createDto.applicationFileNumber,
    );

    const newDecision = await this.noticeOfIntentDecisionService.create(
      createDto,
      noticeOfIntent,
    );

    return this.mapper.mapAsync(
      newDecision,
      NoticeOfIntentDecision,
      NoticeOfIntentDecisionDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateNoticeOfIntentDecisionDto,
  ): Promise<NoticeOfIntentDecisionDto> {
    const updatedDecision = await this.noticeOfIntentDecisionService.update(
      uuid,
      updateDto,
    );
    return this.mapper.mapAsync(
      updatedDecision,
      NoticeOfIntentDecision,
      NoticeOfIntentDecisionDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return await this.noticeOfIntentDecisionService.delete(uuid);
  }

  @Post('/:uuid/file')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(@Param('uuid') decisionUuid: string, @Req() req) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const file = req.body.file;
    await this.noticeOfIntentDecisionService.attachDocument(
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
    const downloadUrl = await this.noticeOfIntentDecisionService.getDownloadUrl(
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
    const downloadUrl = await this.noticeOfIntentDecisionService.getDownloadUrl(
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
    await this.noticeOfIntentDecisionService.deleteDocument(documentUuid);
    return {};
  }

  @Get('/codes')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCodes() {
    const codes = await this.noticeOfIntentDecisionService.fetchCodes();
    return {
      outcomes: await this.mapper.mapArrayAsync(
        codes.outcomes,
        NoticeOfIntentDecisionOutcome,
        NoticeOfIntentDecisionOutcomeDto,
      ),
    };
  }
}
