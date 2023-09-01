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
import { NonApplicationSearchView } from './non-applications/non-applications-view.entity';
import { NonApplicationsAdvancedSearchService } from './non-applications/non-applications.service';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import {
  AdvancedSearchResponseDto,
  AdvancedSearchResultDto,
  ApplicationSearchResultDto,
  NonApplicationSearchResultDto,
  NonApplicationsSearchRequestDto,
  NoticeOfIntentSearchResultDto,
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
    private nonApplicationsSearchService: NonApplicationsAdvancedSearchService,
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

    const nonApplications =
      await this.nonApplicationsSearchService.searchNonApplications(searchDto);

    const mappedSearchResult = this.mapAdvancedSearchResults(
      applicationSearchResult,
      noticeOfIntentSearchService,
      nonApplications,
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
    );

    return {
      total: mappedSearchResult.totalNoticeOfIntents,
      data: mappedSearchResult.noticeOfIntents,
    };
  }

  @Post('/advanced/non-applications')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNonApplications(
    @Body() searchDto: NonApplicationsSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NonApplicationSearchResultDto[]>> {
    const nonApplications =
      await this.nonApplicationsSearchService.searchNonApplications(searchDto);

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      null,
      nonApplications,
    );

    return {
      total: mappedSearchResult.totalNonApplications,
      data: mappedSearchResult.nonApplications,
    };
  }

  private mapAdvancedSearchResults(
    applications: AdvancedSearchResultDto<
      ApplicationSubmissionSearchView[]
    > | null,
    noticeOfIntents: AdvancedSearchResultDto<
      NoticeOfIntentSubmissionSearchView[]
    > | null,
    nonApplications: AdvancedSearchResultDto<NonApplicationSearchView[]> | null,
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

    const mappedNonApplications: NonApplicationSearchResultDto[] = [];
    if (nonApplications?.data && nonApplications?.data.length > 0) {
      mappedNonApplications.push(
        ...nonApplications.data.map((nonApplication) =>
          this.mapNonApplicationToAdvancedSearchResult(nonApplication),
        ),
      );
    }

    response.applications = mappedApplications;
    response.totalApplications = applications?.total ?? 0;
    response.noticeOfIntents = mappedNoticeOfIntents;
    response.totalNoticeOfIntents = noticeOfIntents?.total ?? 0;
    response.nonApplications = mappedNonApplications;
    response.totalNonApplications = nonApplications?.total ?? 0;

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

  private mapNonApplicationToAdvancedSearchResult(
    nonApplication: NonApplicationSearchView,
  ): NonApplicationSearchResultDto {
    return {
      referenceId: nonApplication.cardUuid,
      fileNumber: nonApplication.fileNumber,
      applicant: nonApplication.applicant,
      boardCode: nonApplication.boardCode,
      type: nonApplication.type,
      localGovernmentName: nonApplication.localGovernment?.name ?? null,
      class: nonApplication.class,
    };
  }
}
