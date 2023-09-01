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
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { CovenantAdvancedSearchService } from './covenant/covenant-advanced-search.service';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { PlanningReviewAdvancedService } from './planning-review/planning-review-advanced-search.service';
import {
  AdvancedSearchResponseDto,
  AdvancedSearchResultDto,
  ApplicationSearchResultDto,
  CovenantSearchRequestDto,
  CovenantSearchResultDto,
  NoticeOfIntentSearchResultDto,
  PlanningReviewSearchRequestDto,
  PlanningReviewSearchResultDto,
  SearchRequestDto,
  SearchResultDto,
} from './search.dto';
import { SearchService } from './search.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    @InjectMapper() private mapper: Mapper,
    private noticeOfIntentSearchService: NoticeOfIntentAdvancedSearchService,
    private applicationSearchService: ApplicationAdvancedSearchService,
    private planningReviewSearchService: PlanningReviewAdvancedService,
    private covenantSearchService: CovenantAdvancedSearchService,
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
    const applicationSearchResult =
      await this.applicationSearchService.searchApplications(searchDto);

    const noticeOfIntentSearchService =
      await this.noticeOfIntentSearchService.searchNoticeOfIntents(searchDto);

    const planningReviews =
      await this.planningReviewSearchService.searchPlanningReviews(searchDto);

    const covenants = await this.covenantSearchService.searchCovenants(
      searchDto,
    );

    const mappedSearchResult = this.mapAdvancedSearchResults(
      applicationSearchResult,
      noticeOfIntentSearchService,
      planningReviews,
      covenants,
    );

    return mappedSearchResult;
  }

  @Post('/advanced/application')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchApplications(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<ApplicationSearchResultDto[]>> {
    const applications = await this.applicationSearchService.searchApplications(
      searchDto,
    );

    const mappedSearchResult = this.mapAdvancedSearchResults(
      applications,
      null,
      null,
      null,
    );

    return {
      total: mappedSearchResult.totalApplications,
      data: mappedSearchResult.applications,
    };
  }

  @Post('/advanced/notice-of-intent')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNoticeOfIntents(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentSearchResultDto[]>> {
    const noticeOfIntents =
      await this.noticeOfIntentSearchService.searchNoticeOfIntents(searchDto);

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      noticeOfIntents,
      null,
      null,
    );

    return {
      total: mappedSearchResult.totalNoticeOfIntents,
      data: mappedSearchResult.noticeOfIntents,
    };
  }

  @Post('/advanced/planning-review')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchPlanningReviews(
    @Body() searchDto: PlanningReviewSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<PlanningReviewSearchResultDto[]>> {
    const planningReviews =
      await this.planningReviewSearchService.searchPlanningReviews(searchDto);

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      null,
      planningReviews,
      null,
    );

    return {
      total: mappedSearchResult.totalPlanningReviews,
      data: mappedSearchResult.planningReviews,
    };
  }

  @Post('/advanced/covenant')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchCovenants(
    @Body() searchDto: CovenantSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<CovenantSearchResultDto[]>> {
    const covenants = await this.covenantSearchService.searchCovenants(
      searchDto,
    );

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      null,
      null,
      covenants,
    );

    return {
      total: mappedSearchResult.totalCovenants,
      data: mappedSearchResult.covenants,
    };
  }

  private mapAdvancedSearchResults(
    applications: AdvancedSearchResultDto<
      ApplicationSubmissionSearchView[]
    > | null,
    noticeOfIntents: AdvancedSearchResultDto<
      NoticeOfIntentSubmissionSearchView[]
    > | null,
    planningReviews: AdvancedSearchResultDto<PlanningReview[]> | null,
    covenants: AdvancedSearchResultDto<Covenant[]> | null,
  ) {
    const response = new AdvancedSearchResponseDto();

    const mappedApplications: ApplicationSearchResultDto[] = [];
    if (applications && applications.data.length > 0) {
      mappedApplications.push(
        ...applications.data.map((app) =>
          this.mapApplicationToAdvancedSearchResult(app),
        ),
      );
    }

    const mappedNoticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
    if (noticeOfIntents && noticeOfIntents.data.length > 0) {
      mappedNoticeOfIntents.push(
        ...noticeOfIntents.data.map((noi) =>
          this.mapNoticeOfIntentToAdvancedSearchResult(noi),
        ),
      );
    }

    const mappedPlanningReviews: PlanningReviewSearchResultDto[] = [];
    if (planningReviews?.data && planningReviews?.data.length > 0) {
      mappedPlanningReviews.push(
        ...planningReviews.data.map((planReview) =>
          this.mapPlanningReviewToAdvancedSearchResult(planReview),
        ),
      );
    }

    const mappedCovenants: CovenantSearchResultDto[] = [];
    if (covenants?.data && covenants?.data.length > 0) {
      mappedCovenants.push(
        ...covenants.data.map((cov) =>
          this.mapCovenantToAdvancedSearchResult(cov),
        ),
      );
    }

    response.applications = mappedApplications;
    response.totalApplications = applications?.total ?? 0;
    response.noticeOfIntents = mappedNoticeOfIntents;
    response.totalNoticeOfIntents = noticeOfIntents?.total ?? 0;
    response.planningReviews = mappedPlanningReviews;
    response.totalPlanningReviews = planningReviews?.total ?? 0;
    response.covenants = mappedCovenants;
    response.totalPlanningReviews = covenants?.total ?? 0;

    return response;
  }

  private mapApplicationToAdvancedSearchResult(
    application: ApplicationSubmissionSearchView,
  ): ApplicationSearchResultDto {
    return {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      dateSubmitted: application.dateSubmittedToAlc?.getTime(),
      type: this.mapper.map(
        application.applicationType,
        ApplicationType,
        ApplicationTypeDto,
      ),
      localGovernmentName: application.localGovernmentName,
      ownerName: application.applicant,
      class: 'APP',
      status: application.status.status_type_code,
    };
  }

  private mapNoticeOfIntentToAdvancedSearchResult(
    noi: NoticeOfIntentSubmissionSearchView,
  ): NoticeOfIntentSearchResultDto {
    return {
      referenceId: noi.fileNumber,
      fileNumber: noi.fileNumber,
      dateSubmitted: noi.dateSubmittedToAlc?.getTime(),
      type: this.mapper.map(
        noi.noticeOfIntentType,
        ApplicationType,
        ApplicationTypeDto,
      ),
      localGovernmentName: noi.localGovernmentName,
      ownerName: noi.applicant,
      class: 'NOI',
      status: noi.status.status_type_code,
    };
  }

  private mapPlanningReviewToAdvancedSearchResult(
    planningReview: PlanningReview,
  ): PlanningReviewSearchResultDto {
    return {
      referenceId: planningReview.cardUuid,
      fileNumber: planningReview.fileNumber,
      type: planningReview.type,
      localGovernmentName: planningReview.localGovernment.name,
      class: 'PLN',
    };
  }

  private mapCovenantToAdvancedSearchResult(
    covenant: Covenant,
  ): CovenantSearchResultDto {
    return {
      referenceId: covenant.cardUuid,
      fileNumber: covenant.fileNumber,
      ownerName: covenant.applicant,
      localGovernmentName: covenant.localGovernment.name,
      class: 'COV',
    };
  }
}
