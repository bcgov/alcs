import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { PlanningReview } from '../../planning-review/planning-review.entity';
import {
  AdvancedSearchResultDto,
  PlanningReviewSearchRequestDto,
} from '../search.dto';

@Injectable()
export class PlanningReviewAdvancedService {
  constructor(
    @InjectRepository(PlanningReview)
    private planningReviewRepository: Repository<PlanningReview>,
  ) {}

  async searchPlanningReviews(
    searchDto: PlanningReviewSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<PlanningReview[]>> {
    const whereClauses = this.generateWhereClauses(searchDto);
    const orderClause = this.generateOrderClause(
      searchDto.sortField,
      searchDto.sortDirection,
    );

    const result = await this.planningReviewRepository.findAndCount({
      where: whereClauses,
      relations: {
        localGovernment: true,
      },
      skip: (searchDto.page - 1) * searchDto.pageSize,
      take: searchDto.pageSize,
      order: orderClause,
    });

    return {
      data: result[0],
      total: result[1],
    };
  }

  private generateWhereClauses(
    searchDto: PlanningReviewSearchRequestDto,
  ): FindOptionsWhere<PlanningReview> | undefined {
    const whereClause: FindOptionsWhere<PlanningReview> = {};

    if (searchDto.fileNumber) {
      whereClause.fileNumber = searchDto.fileNumber;
    }

    if (searchDto.governmentName) {
      whereClause.localGovernment = {
        name: searchDto.governmentName,
      };
    }

    if (searchDto.regionCode) {
      whereClause.regionCode = searchDto.regionCode;
    }

    return whereClause;
  }

  private generateOrderClause(
    sortField: string,
    sortDirection: 'ASC' | 'DESC' = 'DESC',
  ): FindOptionsOrder<PlanningReview> {
    switch (sortField) {
      case 'type':
        return { type: sortDirection };
      case 'localGovernment':
        return {
          localGovernment: {
            name: sortDirection,
          },
        };
      default:
      case 'fileId':
        return { fileNumber: sortDirection };
    }
  }
}
