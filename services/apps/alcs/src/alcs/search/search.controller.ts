import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { Application } from '../application/application.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { SearchService } from './search.service';

export class SearchResultDto {
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
}

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

    // const cardUuids: string[] = [];

    const start5 = performance.now();
    const result: SearchResultDto[] = [];

    if (application) {
      // cardUuids.push(application.cardUuid);
      result.push(this.mapApplicationToSearchResult(application));
    }

    if (noi) {
      // cardUuids.push(noi.cardUuid);
      result.push(this.mapNoticeOfIntentToSearchResult(noi));
    }

    if (planningReview) {
      // cardUuids.push(planningReview.cardUuid);
      result.push(this.mapPlanningReviewToSearchResult(planningReview));
    }

    if (covenant) {
      // cardUuids.push(covenant.cardUuid);
      result.push(this.mapCovenantToSearchResult(covenant));
    }
    const end5 = performance.now();
    console.log(`Execution time mapping: ${end5 - start5} ms`);

    // TODO join cards in relations instead of retrieving them separately
    // let cards: Card[] = [];
    // if (cardUuids.length > 0) {
    //   cards = await this.searchService.getCards(cardUuids);
    // }

    const end = performance.now();
    console.log(`Execution time total: ${end - start} ms`);

    console.log('application', application);
    console.log('noi', noi);
    console.log('planningReview', planningReview);
    console.log('covenant', covenant);
    // console.log('cards', cards);
    console.log('result', result);

    // TODO Use generalized dto for as a response
    return result;
  }

  mapApplicationToSearchResult(application: Application) {
    const result = {
      type: CARD_TYPE.APP,
      referenceId: application.fileNumber,
      localGovernmentName: application.localGovernment?.name,
      applicant: application.applicant,
    } as SearchResultDto;

    return result;
  }

  mapNoticeOfIntentToSearchResult(noi: NoticeOfIntent) {
    const result = {
      type: CARD_TYPE.NOI,
      referenceId: noi.fileNumber,
      localGovernmentName: noi.localGovernment?.name,
      applicant: noi.applicant,
    } as SearchResultDto;

    return result;
  }

  mapPlanningReviewToSearchResult(planning: PlanningReview) {
    const result = {
      type: CARD_TYPE.PLAN,
      referenceId: planning.cardUuid,
      localGovernmentName: planning.localGovernment?.name,
    } as SearchResultDto;

    return result;
  }

  mapCovenantToSearchResult(covenant: Covenant) {
    const result = {
      type: CARD_TYPE.COV,
      referenceId: covenant.cardUuid,
      localGovernmentName: covenant.localGovernment?.name,
      applicant: covenant.applicant,
    } as SearchResultDto;

    return result;
  }
}
