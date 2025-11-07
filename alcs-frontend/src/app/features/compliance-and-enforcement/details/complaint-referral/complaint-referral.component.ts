import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import {
  ComplianceAndEnforcementService,
  DEFAULT_C_AND_E_FETCH_OPTIONS,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import {
  ComplianceAndEnforcementDto,
  UpdateComplianceAndEnforcementDto,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { Section } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { submissionDocumentOptions } from '../../draft/draft.component';
import { OverviewComponent } from '../../overview/overview.component';
import { ToastService } from '../../../../services/toast/toast.service';
import { SubmitterComponent } from '../../submitter/submitter.component';
import {
  ComplianceAndEnforcementSubmitterDto,
  UpdateComplianceAndEnforcementSubmitterDto,
} from '../../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { ComplianceAndEnforcementSubmitterService } from '../../../../services/compliance-and-enforcement/submitter/submitter.service';
import { AddSubmitterDialogComponent } from './submitters/add-submitter-dialog/add-submitter-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-complaint-referral',
  templateUrl: './complaint-referral.component.html',
  styleUrls: ['./complaint-referral.component.scss'],
})
export class ComplaintReferralComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  Section = Section;

  @ViewChild(OverviewComponent) overviewComponent?: OverviewComponent;
  @ViewChildren(SubmitterComponent) submitterComponents?: QueryList<SubmitterComponent>;

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;

  form = new FormGroup({});

  editing: string | null = null;

  submissionDocumentOptions = submissionDocumentOptions;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementService,
    private readonly submitterService: ComplianceAndEnforcementSubmitterService,
    private readonly toastService: ToastService,
    private readonly confirmationService: ConfirmationDialogService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.editing = this.route.snapshot.data['editing'];

    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      if (file) {
        this.file = file;
        this.fileNumber = file.fileNumber;
        this.submissionDocumentOptions.fileId = file.fileNumber;
      }
    });
  }

  async saveOverview() {
    const updateDto: UpdateComplianceAndEnforcementDto = this.overviewComponent?.$changes.getValue() ?? {};

    if (!this.fileNumber) {
      console.error('Error loading file by file number. File number not defined.');
      this.toastService.showErrorToast('Error loading file');
      return;
    }

    try {
      await firstValueFrom(this.service.update(this.fileNumber, updateDto, { idType: 'fileNumber' }));
      this.toastService.showSuccessToast('Overview updated successfully');
      this.router.navigate(['../..'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error updating overview:', error);
      this.toastService.showErrorToast('Error updating overview');
    }
  }

  async saveSubmitters() {
    if (!this.submitterComponents) {
      return;
    }

    const submitters: { uuid: string; dto: UpdateComplianceAndEnforcementSubmitterDto }[] = this.submitterComponents
      .toArray()
      .flatMap((submitterComponent) => {
        const [uuid, dto] = submitterComponent.$changes.getValue();

        return uuid ? [{ uuid, dto }] : [];
      });

    try {
      await firstValueFrom(this.submitterService.bulkUpdate(submitters));
      this.toastService.showSuccessToast('Submitters updated successfully');
      this.router.navigate(['../..'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error updating submitters:', error);
      this.toastService.showErrorToast('Error updating submitters');
    }
  }

  async openNewSubmitterDialog() {
    this.dialog
      .open(AddSubmitterDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileUuid: this.file?.uuid,
          initialSubmissionType: this.file?.initialSubmissionType,
          service: this.submitterService,
        },
      })
      .afterClosed()
      .subscribe(async (saveSuccessful) => {
        if (saveSuccessful) {
          if (this.fileNumber) {
            await this.service.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
          }
        }
      });
  }

  async deleteSubmitter(uuid: string) {
    this.confirmationService
      .openDialog({
        body: 'Are you sure you want to delete this submitter?',
      })
      .subscribe(async (isConfirmed) => {
        if (isConfirmed) {
          try {
            await this.submitterService.delete(uuid);
            this.toastService.showSuccessToast('Submitter deleted');

            if (this.fileNumber) {
              this.service.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
            }
          } catch (error) {
            console.error(error);
            this.toastService.showErrorToast('Failed to delete submitter');
          }
        }
      });
  }

  registerFormGroup(name: string, formGroup: FormGroup) {
    setTimeout(() => {
      this.form.setControl(name, formGroup);
    });
  }

  trackByUuid(_: number, item: ComplianceAndEnforcementSubmitterDto) {
    return item.uuid;
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
