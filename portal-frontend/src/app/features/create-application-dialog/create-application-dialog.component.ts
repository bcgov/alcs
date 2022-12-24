import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationService } from '../../services/application/application.service';
import { ApplicationTypeDto, SubmissionTypeDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';

@Component({
  selector: 'app-create-application-dialog',
  templateUrl: './create-application-dialog.component.html',
  styleUrls: ['./create-application-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateApplicationDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  submissionTypes: SubmissionTypeDto[] = [];
  applicationType: string = '';
  currentStepIndex: number = 0;

  constructor(
    private dialogRef: MatDialogRef<CreateApplicationDialogComponent>,
    private codeService: CodeService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes.filter((type) => !!type.portalLabel);
    // TODO: this should be from alcs?
    this.submissionTypes = [
      { code: 'APP', label: 'Application', description: '' },
      { code: 'NOI', label: 'Notice of Intent', description: '' },
      { code: 'SRW', label: 'Notification of Statutory Right of Way (SRW)', description: '' },
    ];
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    const res = await this.applicationService.create(this.applicationType);
    if (res) {
      await this.router.navigateByUrl(`/application/${res.fileId}`);
      this.dialogRef.close(true);
    }
  }

  onStepChange(idx: number) {
    this.currentStepIndex += idx;
  }
}
