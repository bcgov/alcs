import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { SearchService } from './search.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('/:searchTerm')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Param('searchTerm') searchTerm) {
    // try fetch application
    //     this includes Modification, Reconsideration
    // try fetch noi
    // try fetch covenant
    // try fetch planning
    const application = await this.searchService.getApplication(searchTerm);

    const noi = await this.searchService.getNoi(searchTerm);

    const planningReview = await this.searchService.getPlanningReview(
      searchTerm,
    );

    const covenant = await this.searchService.getCovenant(searchTerm);

    console.log('application', application);
    console.log('noi', noi);
    console.log('planningReview', planningReview);
    console.log('covenant', covenant);

    // TODO Use generalized dto for as a response
    return application;
  }
}
