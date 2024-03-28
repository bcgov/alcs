import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { Column } from 'typeorm';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class PlanningReviewMeetingTypeDto extends BaseCodeDto {}

export class PlanningReviewMeetingDto {
  @AutoMap()
  uuid: string;

  @AutoMap(() => PlanningReviewMeetingTypeDto)
  type: PlanningReviewMeetingTypeDto;

  date: number;

  @AutoMap()
  @Column({ type: 'uuid' })
  planningReviewUuid: string;
}

export class UpdatePlanningReviewMeetingDto {
  @IsString()
  @IsNotEmpty()
  typeCode: string;

  @IsNumber()
  @IsNotEmpty()
  date: number;
}

export class CreatePlanningReviewMeetingDto extends UpdatePlanningReviewMeetingDto {
  @IsUUID()
  @IsNotEmpty()
  planningReviewUuid: string;
}
