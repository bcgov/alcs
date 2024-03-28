import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { PlanningReviewMeetingType } from './planning-review-meeting-type.entity';
import {
  CreatePlanningReviewMeetingDto,
  PlanningReviewMeetingDto,
  PlanningReviewMeetingTypeDto,
  UpdatePlanningReviewMeetingDto,
} from './planning-review-meeting.dto';
import { PlanningReviewMeeting } from './planning-review-meeting.entity';
import { PlanningReviewMeetingService } from './planning-review-meeting.service';

@Controller('planning-review-meeting')
export class PlanningReviewMeetingController {
  constructor(
    private readonly service: PlanningReviewMeetingService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/planning-review/:uuid')
  async findAllByPlanningReview(
    @Param(':uuid') uuid: string,
  ): Promise<PlanningReviewMeetingDto[]> {
    const meetings = await this.service.getByPlanningReview(uuid);
    return this.mapper.mapArray(
      meetings,
      PlanningReviewMeeting,
      PlanningReviewMeetingDto,
    );
  }

  @Get(':uuid')
  async findOne(
    @Param('uuid') uuid: string,
  ): Promise<PlanningReviewMeetingDto> {
    const meeting = await this.service.getByUuid(uuid);
    return this.mapper.map(
      meeting,
      PlanningReviewMeeting,
      PlanningReviewMeetingDto,
    );
  }

  @Get('types')
  async listTypes(): Promise<PlanningReviewMeetingTypeDto[]> {
    const types = await this.service.listTypes();
    return this.mapper.mapArray(
      types,
      PlanningReviewMeetingType,
      PlanningReviewMeetingTypeDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: CreatePlanningReviewMeetingDto,
  ): Promise<PlanningReviewMeetingDto> {
    const newMeeting = await this.service.create(createDto);
    return this.mapper.map(
      newMeeting,
      PlanningReviewMeeting,
      PlanningReviewMeetingDto,
    );
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') id: string,
    @Body() updateDto: UpdatePlanningReviewMeetingDto,
  ) {
    await this.service.update(id, updateDto);
    return {
      success: true,
    };
  }

  @Delete(':uuid')
  remove(@Param('uuid') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
