import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationBoundaryAmendmentDto } from '../../../services/application/application-boundary-amendments/application-boundary-amendment.dto';
import { ApplicationBoundaryAmendmentService } from '../../../services/application/application-boundary-amendments/application-boundary-amendment.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { EditBoundaryAmendmentDialogComponent } from './edit-boundary-amendment-dialog/edit-boundary-amendment-dialog.component';

@Component({
  selector: 'app-boundary-amendment',
  templateUrl: './boundary-amendment.component.html',
  styleUrls: ['./boundary-amendment.component.scss'],
})
export class BoundaryAmendmentComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application?: ApplicationDto;
  amendments: ApplicationBoundaryAmendmentDto[] = [];
  private fileNumber: string = '';

  constructor(
    private boundaryAmendmentService: ApplicationBoundaryAmendmentService,
    private applicationDetailService: ApplicationDetailService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe(async (application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.application = application;
        this.loadAmendments();
      }
    });
  }

  async loadAmendments() {
    this.amendments = await this.boundaryAmendmentService.list(this.fileNumber);
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onCreateAmendment() {
    this.dialog
      .open(EditBoundaryAmendmentDialogComponent, {
        data: {
          fileNumber: this.fileNumber,
          uuid: this.application?.uuid,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.loadAmendments();
        }
      });
  }

  onEditAmendment(amendment: ApplicationBoundaryAmendmentDto) {
    this.dialog
      .open(EditBoundaryAmendmentDialogComponent, {
        data: {
          fileNumber: this.fileNumber,
          uuid: this.application?.uuid,
          existingAmendment: amendment,
        },
      })
      .afterClosed()
      .subscribe((didEdit) => {
        if (didEdit) {
          this.loadAmendments();
        }
      });
  }

  onDeleteAmendment(uuid: string) {
    this.boundaryAmendmentService.delete(uuid);
    this.loadAmendments();
  }
}
