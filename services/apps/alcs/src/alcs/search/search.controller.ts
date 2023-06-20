import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { SearchResultDto } from './search.dto';
import { SearchService } from './search.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:searchTerm')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Param('searchTerm') searchTerm) {
    const start = performance.now();

    const start1 = performance.now();
    const application = await this.searchService.getApplication(searchTerm);
    const end1 = performance.now();
    console.log(`Execution time app: ${end1 - start1} ms`);

    const start2 = performance.now();
    const noi = await this.searchService.getNoi(searchTerm);
    const end2 = performance.now();
    console.log(`Execution time noi: ${end2 - start2} ms`);

    const start3 = performance.now();
    const planningReview = await this.searchService.getPlanningReview(
      searchTerm,
    );
    const end3 = performance.now();
    console.log(`Execution time planningReview: ${end3 - start3} ms`);

    const start4 = performance.now();
    const covenant = await this.searchService.getCovenant(searchTerm);
    const end4 = performance.now();
    console.log(`Execution time covenant: ${end4 - start4} ms`);
    const start5 = performance.now();
    const result: SearchResultDto[] = [];

    this.mapSearchResults(result, application, noi, planningReview, covenant);

    const end5 = performance.now();
    console.log(`Execution time mapping: ${end5 - start5} ms`);

    const end = performance.now();
    console.log(`Execution time total: ${end - start} ms`);

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
}
