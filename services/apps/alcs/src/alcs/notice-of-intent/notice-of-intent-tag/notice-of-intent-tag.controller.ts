import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import * as config from 'config';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';
import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';
import { NoticeOfIntentTagDto } from './notice-of-intent-tag.dto';

@Controller('notice-of-intent/:fileNumber/tag')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class NoticeOfIntentTagController {
  constructor(private service: NoticeOfIntentTagService) {}

  @Get('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getApplicationTags(@Param('fileNumber') fileNumber: string) {
    return await this.service.getNoticeOfIntentTags(fileNumber);
  }

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async addTagToApplication(@Param('fileNumber') fileNumber: string, @Body() dto: NoticeOfIntentTagDto) {
    return await this.service.addTagToNoticeOfIntent(fileNumber, dto.tagName);
  }

  @Delete('/:tagName')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async removeTagFromApplication(@Param('fileNumber') fileNumber: string, @Param('tagName') tagName: string) {
    return await this.service.removeTagFromNoticeOfIntent(fileNumber, tagName);
  }
}
