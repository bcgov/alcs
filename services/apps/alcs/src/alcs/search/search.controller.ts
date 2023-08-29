import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { Application } from '../application/application.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import {
  ApplicationSearchResultDto,
  SearchRequestDto,
  SearchResultDto,
} from './search.dto';
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

  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  @Get('/:searchTerm')
  async search(@Param('searchTerm') searchTerm) {
    const application = await this.searchService.getApplication(searchTerm);

    const noi = await this.searchService.getNoi(searchTerm);

    const planningReview = await this.searchService.getPlanningReview(
      searchTerm,
    );

    const covenant = await this.searchService.getCovenant(searchTerm);

    const result: SearchResultDto[] = [];

    this.mapSearchResults(result, application, noi, planningReview, covenant);

    return result;
  }

  private mapSearchResults(
    result: SearchResultDto[],
    application: Application | null,
    noi: NoticeOfIntent | null,
    planningReview: PlanningReview | null,
    covenant: Covenant | null,
  ) {
    if (application) {
      result.push(this.mapApplicationToSearchResult(application));
    }

    if (noi) {
      result.push(this.mapNoticeOfIntentToSearchResult(noi));
    }

    if (planningReview) {
      result.push(this.mapPlanningReviewToSearchResult(planningReview));
    }

    if (covenant) {
      result.push(this.mapCovenantToSearchResult(covenant));
    }
  }

  private mapApplicationToSearchResult(application: Application) {
    const result = {
      type: CARD_TYPE.APP,
      referenceId: application.fileNumber,
      localGovernmentName: application.localGovernment?.name,
      applicant: application.applicant,
      fileNumber: application.fileNumber,
      label: this.mapper.map(
        application.type,
        ApplicationType,
        ApplicationTypeDto,
      ),
    } as SearchResultDto;

    return result;
  }

  private mapNoticeOfIntentToSearchResult(noi: NoticeOfIntent) {
    const result = {
      type: CARD_TYPE.NOI,
      referenceId: noi.fileNumber,
      localGovernmentName: noi.localGovernment?.name,
      applicant: noi.applicant,
      fileNumber: noi.fileNumber,
    } as SearchResultDto;

    return result;
  }

  private mapPlanningReviewToSearchResult(planning: PlanningReview) {
    const result = {
      type: CARD_TYPE.PLAN,
      referenceId: planning.cardUuid,
      localGovernmentName: planning.localGovernment?.name,
      fileNumber: planning.fileNumber,
      boardCode: planning.card.board.code,
    } as SearchResultDto;

    return result;
  }

  private mapCovenantToSearchResult(covenant: Covenant) {
    const result = {
      type: CARD_TYPE.COV,
      referenceId: covenant.cardUuid,
      localGovernmentName: covenant.localGovernment?.name,
      applicant: covenant.applicant,
      fileNumber: covenant.fileNumber,
      boardCode: covenant.card.board.code,
    } as SearchResultDto;

    return result;
  }

  @Post('/advanced')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearch(@Body() searchDto: SearchRequestDto) {
    const applicationSearchResult = await this.searchService.searchApplications(
      searchDto,
    );

    // const noi = await this.searchService.getNoi(searchTerm);

    // const planningReview = await this.searchService.getPlanningReview(
    //   searchTerm,
    // );

    // const covenant = await this.searchService.getCovenant(searchTerm);

    const mappedApplications = this.mapAdvancedSearchResults(
      applicationSearchResult.data,
    );

    return { data: mappedApplications, total: applicationSearchResult.total };
  }

  private mapAdvancedSearchResults(
    applications: ApplicationSubmissionSearchView[],
  ) {
    const mappedApplications: ApplicationSearchResultDto[] = [];
    if (applications.length > 0) {
      mappedApplications.push(
        ...applications.map((app) =>
          this.mapApplicationToAdvancedSearchResult(app),
        ),
      );
    }
    return mappedApplications;
  }

  private mapApplicationToAdvancedSearchResult(
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
      localGovernmentName: application.localGovernmentName,
      ownerName: application.applicant,
      class: 'APP',
      status: application.status.status_type_code,
    } as ApplicationSearchResultDto;

    return result;
  }
}
