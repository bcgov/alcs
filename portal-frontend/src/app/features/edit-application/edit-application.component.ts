import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../services/application-document/application-document.dto';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';

@Component({
  selector: 'app-create-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class EditApplicationComponent implements OnInit, OnDestroy {
  fileId = '';
  documents: ApplicationDocumentDto[] = [];

  $destroy = new Subject<void>();
  $application = new BehaviorSubject<ApplicationDto | undefined>(undefined);
  application: ApplicationDto | undefined;

  // TODO remove
  @ViewChild('stepper') private myStepper!: MatStepper;

  constructor(
    private applicationService: ApplicationService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.fileId = fileId;
        this.loadApplication(fileId).then(() =>
          // TODO remove then from above
          setTimeout(() => {
            // or do some API calls/ Async events
            this.myStepper.next();
            this.myStepper.next();
            this.myStepper.next();
            this.myStepper.next();
            this.myStepper.next();
            this.myStepper.next();
            this.myStepper.next();
          }, 1)
        );
      }
    });

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;
    });
  }

  private async loadApplication(fileId: string) {
    this.application = await this.applicationService.getByFileId(fileId);
    this.$application.next(this.application);
  }

  async onApplicationTypeChangeClicked() {
    this.dialog
      .open(ChangeApplicationTypeDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
        autoFocus: false,
        data: {
          fileId: this.fileId,
        },
      })
      .beforeClosed()
      .subscribe((result) => {
        if (result) {
          this.loadApplication(this.fileId);
        }
      });
  }

  async onSubmitToAlcs() {
    if (!this.application?.localGovernmentUuid) {
      this.toastService.showErrorToast('Please set local government first.');
      return;
    }

    if (this.application) {
      await this.applicationService.submitToAlcs(this.fileId);
    }
  }
}
