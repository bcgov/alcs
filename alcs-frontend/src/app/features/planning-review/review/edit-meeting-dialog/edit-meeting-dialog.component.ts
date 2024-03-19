import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { PlanningReviewDetailService } from '../../../../services/planning-review/planning-review-detail.service';
import {
  PlanningReviewMeetingDto,
  PlanningReviewMeetingTypeDto,
  UpdatePlanningReviewMeetingDto,
} from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.dto';
import { PlanningReviewMeetingService } from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-planning-review-meeting-dialog',
  templateUrl: './edit-meeting-dialog.component.html',
  styleUrls: ['./edit-meeting-dialog.component.scss'],
})
export class EditMeetingDialogComponent {
  isLoading = false;
  types: PlanningReviewMeetingTypeDto[] = [];
  selectedDate: Date | undefined;
  selectedType: string | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      planningReviewUuid: string;
      existingMeeting?: PlanningReviewMeetingDto;
    },
    private dialogRef: MatDialogRef<EditMeetingDialogComponent>,
    private planningReviewMeetingService: PlanningReviewMeetingService,
  ) {
    this.loadTypes();

    if (data.existingMeeting) {
      this.selectedType = data.existingMeeting.type.code;
      this.selectedDate = new Date(data.existingMeeting.date);
    }
  }

  async onSubmit() {
    const updateDto: UpdatePlanningReviewMeetingDto = {
      date: formatDateForApi(this.selectedDate!),
      typeCode: this.selectedType!,
    };
    if (this.data.existingMeeting) {
      await this.planningReviewMeetingService.update(this.data.existingMeeting.uuid, updateDto);
    } else {
      await this.planningReviewMeetingService.create({
        planningReviewUuid: this.data.planningReviewUuid,
        ...updateDto,
      });
    }
    this.dialogRef.close(true);
  }

  private async loadTypes() {
    const types = await this.planningReviewMeetingService.fetchTypes();
    if (types) {
      this.types = types;
    }
  }
}
