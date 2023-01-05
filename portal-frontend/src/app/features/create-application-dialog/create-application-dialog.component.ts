import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { ApplicationService } from '../../services/application/application.service';
import { ApplicationTypeDto, SubmissionTypeDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';

export enum ApplicationCreateDialogStepsEnum {
  submissionType = 0,
  applicationType = 1,
}

@Component({
  selector: 'app-create-application-dialog',
  templateUrl: './create-application-dialog.component.html',
  styleUrls: ['./create-application-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateApplicationDialogComponent implements OnInit {
  submissionStep = ApplicationCreateDialogStepsEnum.submissionType;
  applicationStep = ApplicationCreateDialogStepsEnum.applicationType;

  applicationTypes: ApplicationTypeDto[] = [];
  selectedAppType: ApplicationTypeDto | undefined = undefined;

  selectedSubmissionType: SubmissionTypeDto | undefined = undefined;
  submissionTypes: SubmissionTypeDto[] = [];

  readMoreClicked: boolean = false;
  readMoreVisible: boolean = true;
  currentStepIndex: number = 0;

  constructor(
    private dialogRef: MatDialogRef<CreateApplicationDialogComponent>,
    private codeService: CodeService,
    private applicationService: ApplicationService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe((result: BreakpointState) => {
      if (result.matches) {
      } else {
      }
    });
  }

  ngOnInit(): void {
    this.loadCodes();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes.filter((type) => !!type.portalLabel);
    // TODO: this should be from alcs?
    this.submissionTypes = [
      {
        code: 'APP',
        description: '',
        label: 'Application',
        htmlDescription: `Create an <a target="_blank"
      href="https://www.alc.gov.bc.ca/application-and-notice-process/applications/">Application</a> if you are
  proposing to exclude, include, subdivide, conduct a non-farm use activity, conduct a non-adhering residential
  use, conduct a transportation/utility/recreational trail use, or conduct a soil or fill use. Non-adhering
  residential use applications have a fee of $750. All other applications have a fee of $1,500 fee, except for
  inclusion of land (no fee). Application fees are split equally between the
  local government and the ALC.`,
      },
      {
        code: 'NOI',
        label: 'Notice of Intent',
        description: '',
        htmlDescription: `Create a <a target="_blank"
      href="https://www.alc.gov.bc.ca/application-and-notice-process/soil-and-fill-notice-of-intent/">Notice of
      Intent</a> if you are proposing to remove soil and/or place fill that does not qualify for exemption under
  Section 35 of the <i>Agricultural Land Reserve Use Regulation</i>. All notices are subject to a $150 fee.`,
      },
      {
        code: 'SRW',
        description: '',
        label: 'Notification of Statutory Right of Way (SRW)',
        htmlDescription: `Create a <a target="_blank" href="https://www.alc.gov.bc.ca/application-and-notice-process/statutory-right-of-way-notice/">
      Notification of Statutory Right of Way (SRW)</a> if you are notifying the ALC that you are planning to
  register a SRW under section 218 of the <i>Land Title Act</i> in accordance with section 18.1 (2) of the <i>Agricultural
  Land Commission Act</i>.`,
      },
    ];
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    const res = await this.applicationService.create(this.selectedAppType!.code);
    if (res) {
      await this.router.navigateByUrl(`/application/${res.fileId}`);
      this.dialogRef.close(true);
    }
  }

  onStepChange(idx: number) {
    this.currentStepIndex += idx;
    this.readMoreClicked = false;
  }

  onSubmissionTypeSelected(event: MatRadioChange) {
    this.selectedSubmissionType = this.submissionTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;
  }

  onReadMoreClicked() {
    this.readMoreClicked = !this.readMoreClicked;
  }

  onAppTypeSelected(event: MatRadioChange) {
    this.selectedAppType = this.applicationTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    return el ? el.clientHeight < el.scrollHeight : false;
  }

  isReadMoreVisible(): boolean {
    switch (this.currentStepIndex) {
      case this.applicationStep:
        return this.readMoreClicked || this.isEllipsisActive('appTypeDescription');
      case this.submissionStep:
        return this.readMoreClicked || this.isEllipsisActive('subTypeDescription');
      default:
        return true;
    }
  }
}
