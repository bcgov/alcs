import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import {
  ComplianceAndEnforcementDto,
  UpdateComplianceAndEnforcementDto,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { Section } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { submissionDocumentOptions } from '../../draft/draft.component';
import { OverviewComponent } from '../../overview/overview.component';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-complaint-referral',
  templateUrl: './complaint-referral.component.html',
  styleUrls: ['./complaint-referral.component.scss'],
})
export class ComplaintReferralComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  Section = Section;

  @ViewChild(OverviewComponent) overviewComponent?: OverviewComponent;

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;

  form = new FormGroup({ overview: new FormGroup({}), submitter: new FormGroup({}), property: new FormGroup({}) });

  editing: string | null = null;

  submissionDocumentOptions = submissionDocumentOptions;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.$destroy)).subscribe(async (data) => {
      this.editing = data['editing'];
    });

    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      if (file) {
        this.file = file;
        this.fileNumber = file.fileNumber;
        this.submissionDocumentOptions.fileId = file.fileNumber;
      }
    });
  }

  async save() {
    const updateDto: UpdateComplianceAndEnforcementDto = this.overviewComponent?.$changes.getValue() ?? {};

    if (!this.fileNumber) {
      console.error('Error loading file by file number. File number not defined.');
      this.toastService.showErrorToast('Error loading file');
      return;
    }

    try {
      await firstValueFrom(this.service.update(this.fileNumber, updateDto, { idType: 'fileNumber' }));
      this.toastService.showSuccessToast('File updated successfully');
      this.router.navigate(['../..'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error updating file:', error);
      this.toastService.showErrorToast('Error loading file');
    }
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
