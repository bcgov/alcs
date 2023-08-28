import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { SearchRequestDto, SearchResultDto } from './search.dto';
import { ApplicationSubmissionSearchView } from './search.entity';
import { SearchService } from './search.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Body() searchDto: SearchRequestDto) {
    const applications = await this.searchService.searchApplications(searchDto);

    // const noi = await this.searchService.getNoi(searchTerm);

    // const planningReview = await this.searchService.getPlanningReview(
    //   searchTerm,
    // );

    // const covenant = await this.searchService.getCovenant(searchTerm);

    const result: SearchResultDto[] = [];

    this.mapSearchResults(result, applications);

    return result;
  }

  private mapSearchResults(
    result: SearchResultDto[],
    applications: ApplicationSubmissionSearchView[],
  ) {
    if (applications.length > 0) {
      result.push(
        ...applications.map((app) => this.mapApplicationToSearchResult(app)),
      );
    }

    // if (noi) {
    //   result.push(this.mapNoticeOfIntentToSearchResult(noi));
    // }

    // if (planningReview) {
    //   result.push(this.mapPlanningReviewToSearchResult(planningReview));
    // }

    // if (covenant) {
    //   result.push(this.mapCovenantToSearchResult(covenant));
    // }
  }

  private mapApplicationToSearchResult(
    application: ApplicationSubmissionSearchView,
  ) {
    const result = {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      dateSubmitted: application.dateSubmittedToAlc,
      type: this.mapper.map(
        application.applicationType,
        ApplicationType,
        ApplicationTypeDto,
      ),
      localGovernmentName: 'to map', // TODO map
      label: undefined, // TODO map
    } as SearchResultDto;

    return result;
  }

  // private mapNoticeOfIntentToSearchResult(noi: NoticeOfIntent) {
  //   const result = {
  //     type: CARD_TYPE.NOI,
  //     referenceId: noi.fileNumber,
  //     localGovernmentName: noi.localGovernment?.name,
  //     applicant: noi.applicant,
  //     fileNumber: noi.fileNumber,
  //   } as SearchResultDto;

  //   return result;
  // }

  // private mapPlanningReviewToSearchResult(planning: PlanningReview) {
  //   const result = {
  //     type: CARD_TYPE.PLAN,
  //     referenceId: planning.cardUuid,
  //     localGovernmentName: planning.localGovernment?.name,
  //     fileNumber: planning.fileNumber,
  //     boardCode: planning.card.board.code,
  //   } as SearchResultDto;

  //   return result;
  // }

  // private mapCovenantToSearchResult(covenant: Covenant) {
  //   const result = {
  //     type: CARD_TYPE.COV,
  //     referenceId: covenant.cardUuid,
  //     localGovernmentName: covenant.localGovernment?.name,
  //     applicant: covenant.applicant,
  //     fileNumber: covenant.fileNumber,
  //     boardCode: covenant.card.board.code,
  //   } as SearchResultDto;

  //   return result;
  // }
}
