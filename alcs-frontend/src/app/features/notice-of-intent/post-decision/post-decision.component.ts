import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, tap } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { EditModificationDialogComponent } from './edit-modification-dialog/edit-modification-dialog.component';
import { CreateNoiModificationDialogComponent } from '../../board/dialogs/noi-modification/create/create-noi-modification-dialog.component';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';

type LoadingModifications = NoticeOfIntentModificationDto & {
  modifiesDecisionsNumbers: string[];
  canBeDeleted: boolean;
};
@Component({
    selector: 'app-noi-post-decision',
    templateUrl: './post-decision.component.html',
    styleUrls: ['./post-decision.component.scss'],
    standalone: false
})
export class PostDecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  fileNumber: string = '';
  applicant: string = '';
  localGovernment: ApplicationLocalGovernmentDto | undefined = undefined;
  region: ApplicationRegionDto | undefined = undefined;
  modifications: LoadingModifications[] = [];

  constructor(
    public dialog: MatDialog,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private modificationService: NoticeOfIntentModificationService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(
        tap((noticeOfIntent) => {
          if (noticeOfIntent) {
            this.fileNumber = noticeOfIntent.fileNumber;
            this.applicant = noticeOfIntent.applicant;
            this.localGovernment = noticeOfIntent.localGovernment;
            this.region = noticeOfIntent.region;

            // Now we have the fileNumber, fetch fresh modifications
            this.modificationService.fetchByFileNumber(noticeOfIntent.fileNumber);
          }
        }),
        takeUntil(this.$destroy),
      )
      .subscribe();

    // Second subscription to monitor modifications updates
    this.modificationService.$modifications.pipe(takeUntil(this.$destroy)).subscribe((modifications) => {
      this.modifications =
        modifications?.map((m) => ({
          ...m,
          modifiesDecisionsNumbers: m.modifiesDecisions.flatMap((d) => `#${d.resolutionNumber}/${d.resolutionYear}`),
          canBeDeleted: !m.resultingDecision,
        })) ?? [];
    });
  }

  onCreateModification() {
    this.dialog
      .open(CreateNoiModificationDialogComponent, {
        minWidth: '600px',
        maxWidth: '1100px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
          applicant: this.applicant,
          localGovernment: this.localGovernment,
          region: this.region,
        },
      })
      .afterClosed()
      .subscribe(async (answer) => {
        if (answer) {
          await this.modificationService.fetchByFileNumber(this.fileNumber);
        }
      });
  }

  onEditModification(modification: NoticeOfIntentModificationDto) {
    this.dialog
      .open(EditModificationDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        autoFocus: false,
        data: {
          fileNumber: this.fileNumber,
          existingModification: modification,
        },
      })
      .afterClosed()
      .subscribe((wasModified) => {
        if (wasModified) {
          this.noticeOfIntentDetailService.load(this.fileNumber);
        }
      });
  }

  async deleteModification(uuid: string, index: number) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete Modification Request #${index}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.modificationService.delete(uuid);
          await this.modificationService.fetchByFileNumber(this.fileNumber);
        }
      });
  }

  async onSaveModificationOutcome(uuid: string, reviewOutcomeCode: string) {
    await this.modificationService.update(uuid, {
      reviewOutcomeCode,
    });
    await this.modificationService.fetchByFileNumber(this.fileNumber);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
