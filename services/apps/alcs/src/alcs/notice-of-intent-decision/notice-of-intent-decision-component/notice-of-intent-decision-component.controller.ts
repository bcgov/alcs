import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  NoticeOfIntentDecisionComponentDto,
  UpdateNoticeOfIntentDecisionComponentDto,
} from './notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionComponent } from './notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionComponentService } from './notice-of-intent-decision-component.service';

@Controller('notice-of-intent-decision-component')
export class NoticeOfIntentDecisionComponentController {
  constructor(
    private noticeOfIntentDecisionComponentService: NoticeOfIntentDecisionComponentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateNoticeOfIntentDecisionComponentDto,
  ): Promise<NoticeOfIntentDecisionComponentDto> {
    await this.noticeOfIntentDecisionComponentService.getOneOrFail(uuid);

    const updatedComponent =
      await this.noticeOfIntentDecisionComponentService.createOrUpdate([
        updateDto,
      ]);
    return (
      await this.mapper.mapArrayAsync(
        updatedComponent,
        NoticeOfIntentDecisionComponent,
        NoticeOfIntentDecisionComponentDto,
      )
    )[0];
  }
}
