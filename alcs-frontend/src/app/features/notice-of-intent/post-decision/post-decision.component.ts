import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { EditModificationDialogComponent } from './edit-modification-dialog/edit-modification-dialog.component';

type LoadingModifications = NoticeOfIntentModificationDto & {
  modifiesDecisionsNumbers: string[];
};
@Component({
  selector: 'app-noi-post-decision',
  templateUrl: './post-decision.component.html',
  styleUrls: ['./post-decision.component.scss'],
})
export class PostDecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  fileNumber: string = '';
  modifications: LoadingModifications[] = [];

  constructor(
    public dialog: MatDialog,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private modificationService: NoticeOfIntentModificationService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(combineLatestWith(this.modificationService.$modifications))
      .pipe(takeUntil(this.$destroy))
      .subscribe(([application, modifications]) => {
        if (application) {
          this.fileNumber = application.fileNumber;
          this.modifications =
            modifications?.map((m) => ({
              ...m,
              modifiesDecisionsNumbers: m.modifiesDecisions.flatMap(
                (d) => `#${d.resolutionNumber}/${d.resolutionYear}`
              ),
            })) ?? [];
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
