import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../../common/authorization/roles';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { NoticeDto, UpdateNoticeDto } from './notice.dto';
import { ComplianceAndEnforcementNoticeService } from './notice.service';

@Controller('compliance-and-enforcement/chronology/notice')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementNoticeController {
  constructor(private readonly service: ComplianceAndEnforcementNoticeService) {}

  @Get('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async getAll(@Query('filterByEntryUuid') filterByEntryUuid?: string): Promise<NoticeDto[]> {
    return await this.service.getAll({ filterByEntryUuid });
  }

  @Post('/draft')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async createDraft(@Body() updateDto: UpdateNoticeDto): Promise<{ uuid: string }> {
    const uuid = await this.service.createDraft(updateDto);

    return { uuid };
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(@Param('uuid') uuid: string, @Body() updateDto: UpdateNoticeDto): Promise<NoticeDto> {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<{ uuid: string }> {
    await this.service.delete(uuid);
    return { uuid };
  }
}
