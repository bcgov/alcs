import { isArray } from '@angular/compiler-cli/src/ngtsc/annotations/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment/moment';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationBoundaryAmendmentDto } from '../../../services/application/application-boundary-amendments/application-boundary-amendment.dto';
import { ApplicationBoundaryAmendmentService } from '../../../services/application/application-boundary-amendments/application-boundary-amendment.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
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
  years: { label: string; value: string }[] = [];
  periods: { label: string; value: string }[] = [
    {
      label: '1',
      value: '1',
    },
    {
      label: '2',
      value: '2',
    },
    {
      label: '3',
      value: '3',
    },
    {
      label: '4',
      value: '4',
    },
  ];

  constructor(
    private boundaryAmendmentService: ApplicationBoundaryAmendmentService,
    private applicationDetailService: ApplicationDetailService,
    private confirmationDialogService: ConfirmationDialogService,
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

    const currentYear = moment().year();
    for (let i = currentYear; i >= 1974; i--) {
      this.years.push({
        label: i.toString(10),
        value: i.toString(10),
      });
    }
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
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected Amendment?',
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          await this.boundaryAmendmentService.delete(uuid);
          await this.loadAmendments();
        }
      });
  }

  async onSaveYear(uuid: string, $event: string | string[] | null) {
    if ($event && !Array.isArray($event)) {
      await this.boundaryAmendmentService.update(uuid, {
        year: parseInt($event),
      });
      await this.loadAmendments();
    }
  }

  async onSavePeriod(uuid: string, $event: string | string[] | null) {
    if ($event && !Array.isArray($event)) {
      await this.boundaryAmendmentService.update(uuid, {
        period: parseInt($event),
      });
      await this.loadAmendments();
    }
  }

  async onSaveAlrArea(uuid: string, $event: string | null) {
    if ($event) {
      await this.boundaryAmendmentService.update(uuid, {
        area: parseFloat($event),
      });
      await this.loadAmendments();
    }
  }
}
