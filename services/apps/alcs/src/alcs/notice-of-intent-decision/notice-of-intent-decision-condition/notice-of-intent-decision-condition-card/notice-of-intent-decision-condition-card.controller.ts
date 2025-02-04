import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { NoticeOfIntentDecisionConditionCardService } from './notice-of-intent-decision-condition-card.service';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../../common/authorization/roles';
import {
  NoticeOfIntentDecisionConditionCardBoardDto,
  NoticeOfIntentDecisionConditionCardDto,
  CreateNoticeOfIntentDecisionConditionCardDto,
  UpdateNoticeOfIntentDecisionConditionCardDto,
} from './notice-of-intent-decision-condition-card.dto';
import { NoticeOfIntentDecisionConditionCard } from './notice-of-intent-decision-condition-card.entity';
import { NoticeOfIntentModificationService } from '../../notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionV2Service } from '../../notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent-decision-condition-card')
@UseGuards(RolesGuard)
export class NoticeOfIntentDecisionConditionCardController {
  constructor(
    private service: NoticeOfIntentDecisionConditionCardService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService,
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionV2Service,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async get(@Param('uuid') uuid: string): Promise<NoticeOfIntentDecisionConditionCardDto> {
    const result = await this.service.get(uuid);

    return await this.mapper.map(result, NoticeOfIntentDecisionConditionCard, NoticeOfIntentDecisionConditionCardDto);
  }

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(
    @Body() dto: CreateNoticeOfIntentDecisionConditionCardDto,
  ): Promise<NoticeOfIntentDecisionConditionCardDto> {
    const result = await this.service.create(dto);

    return await this.mapper.map(result, NoticeOfIntentDecisionConditionCard, NoticeOfIntentDecisionConditionCardDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateNoticeOfIntentDecisionConditionCardDto,
  ): Promise<NoticeOfIntentDecisionConditionCardDto> {
    const result = await this.service.update(uuid, dto);

    return await this.mapper.map(result, NoticeOfIntentDecisionConditionCard, NoticeOfIntentDecisionConditionCardDto);
  }

  @Get('/board-card/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByCardUuid(@Param('uuid') uuid: string): Promise<NoticeOfIntentDecisionConditionCardBoardDto> {
    const result = await this.service.getByBoardCard(uuid);
    const dto = await this.mapper.map(
      result,
      NoticeOfIntentDecisionConditionCard,
      NoticeOfIntentDecisionConditionCardBoardDto,
    );
    dto.fileNumber = result.decision.noticeOfIntent.fileNumber;

    const appModifications = await this.noticeOfIntentModificationService.getByNoticeOfIntentDecisionUuid(
      result.decision.uuid,
    );

    dto.isModification = appModifications.length > 0;

    const decisionOrder = await this.noticeOfIntentDecisionService.getDecisionOrder(
      result.decision.noticeOfIntent.fileNumber,
      result.decision.uuid,
    );
    dto.decisionOrder = decisionOrder;

    return dto;
  }

  @Get('/application/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByApplicationFileNumber(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NoticeOfIntentDecisionConditionCardDto[]> {
    const conditionCards =
      await this.noticeOfIntentDecisionService.getForDecisionConditionCardsByFileNumber(fileNumber);
    const dtos: NoticeOfIntentDecisionConditionCardDto[] = [];
    for (const card of conditionCards) {
      const dto = await this.mapper.map(
        card,
        NoticeOfIntentDecisionConditionCard,
        NoticeOfIntentDecisionConditionCardDto,
      );
      dtos.push(dto);
    }
    return dtos;
  }
}
