import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../../common/authorization/roles';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { OrderDto, UpdateOrderDto } from './order.dto';
import { ComplianceAndEnforcementOrderService } from './order.service';

@Controller('compliance-and-enforcement/chronology/order')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementOrderController {
  constructor(private readonly service: ComplianceAndEnforcementOrderService) {}

  @Get('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async getAll(@Query('filterByEntryUuid') filterByEntryUuid?: string): Promise<OrderDto[]> {
    return await this.service.getAll({ filterByEntryUuid });
  }

  @Post('/draft')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async createDraft(@Body() updateDto: UpdateOrderDto): Promise<{ uuid: string }> {
    const uuid = await this.service.createDraft(updateDto);

    return { uuid };
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(@Param('uuid') uuid: string, @Body() updateDto: UpdateOrderDto): Promise<OrderDto> {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<{ uuid: string }> {
    await this.service.delete(uuid);
    
    return { uuid };
  }
}
