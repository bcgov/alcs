import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatestWith, tap } from 'rxjs';
import { ApplicationMasterCodesDto } from '../../../services/application/application-code.dto';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationReconsiderationDetailedDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../services/toast/toast.service';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { PostDecisionDialogComponent } from './post-decision-dialog/post-decision-dialog.component';

@Component({
  selector: 'app-post-decision',
  templateUrl: './post-decision.component.html',
  styleUrls: ['./post-decision.component.scss'],
})
export class PostDecisionComponent implements OnInit {
  fileNumber: string = '';
  postDecisions: ApplicationReconsiderationDetailedDto[] = [];
  codes?: ApplicationMasterCodesDto;

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private applicationReconsiderationService: ApplicationReconsiderationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // TODO add codes here from code service
    combineLatestWith(
      this.applicationDetailService.$application,
      this.applicationReconsiderationService.$reconsiderations
    );

    this.applicationDetailService.$application
      .pipe(
        tap((application) => {
          if (application) {
            this.applicationReconsiderationService.fetchByApplication(application.fileNumber);
          }
        })
      )
      .pipe(combineLatestWith(this.applicationReconsiderationService.$reconsiderations))
      .subscribe(([application, reconsiderations]) => {
        if (application) {
          this.fileNumber = application.fileNumber;
          this.postDecisions = reconsiderations ?? [];
        }
      });
  }

  onEdit(reconsideration: ApplicationReconsiderationDetailedDto) {
    console.log('onEdit', reconsideration);
    this.dialog
      .open(PostDecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
          existingDecision: reconsideration,
          // codes: this.codes,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
  }

  async deletePostDecision(uuid: string) {
    await this.applicationReconsiderationService.delete(uuid);
    this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
    this.toastService.showSuccessToast('Post-Decision deleted');
  }

  async onSaveReviewDate(reconsiderationUuid: string, reviewDate: number) {
    await this.applicationReconsiderationService.update(reconsiderationUuid, {
      reviewDate: formatDateForApi(reviewDate),
    });
    await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
  }

  async onSaveReviewOutcome(reconsiderationUuid: string, isReviewApproved: boolean) {
    await this.applicationReconsiderationService.update(reconsiderationUuid, {
      isReviewApproved,
    });
    await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
  }

  getReviewOutcomeLabel(reviewOutcome: boolean) {
    return reviewOutcome ? 'Proceed' : 'Refused';
  }

  isReviewOutcomeSet(reviewOutcome?: boolean | null) {
    return typeof reviewOutcome === 'boolean';
  }
}
