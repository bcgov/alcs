import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../../common/authorization/roles';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ApplicationLocalGovernmentDto } from './application-local-government.dto';
import { ApplicationLocalGovernmentService } from './application-local-government.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-local-government')
@UseGuards(RolesGuard)
export class ApplicationLocalGovernmentController {
  constructor(
    private applicationLocalGovernmentService: ApplicationLocalGovernmentService,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async list(): Promise<ApplicationLocalGovernmentDto[]> {
    const localGovernments =
      await this.applicationLocalGovernmentService.listActive();

    return localGovernments.map((government) => ({
      name: government.name,
      preferredRegionCode: government.preferredRegion.code,
      uuid: government.uuid,
      isFirstNation: government.isFirstNation,
    }));
  }
}
