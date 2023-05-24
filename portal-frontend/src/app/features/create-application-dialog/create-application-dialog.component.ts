import { AfterViewChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { ApplicationTypeDto, SubmissionTypeDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';
import { scrollToElement } from '../../shared/utils/scroll-helper';

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
export class CreateApplicationDialogComponent implements OnInit, AfterViewChecked {
  submissionStep = ApplicationCreateDialogStepsEnum.submissionType;
  applicationStep = ApplicationCreateDialogStepsEnum.applicationType;

  applicationTypes: ApplicationTypeDto[] = [];
  selectedAppType: ApplicationTypeDto | undefined = undefined;

  selectedSubmissionType: SubmissionTypeDto | undefined = undefined;
  submissionTypes: SubmissionTypeDto[] = [];

  readMoreClicked: boolean = false;
  isReadMoreVisible: boolean = false;
  currentStepIndex: number = 0;

  constructor(
    private dialogRef: MatDialogRef<CreateApplicationDialogComponent>,
    private codeService: CodeService,
    private applicationService: ApplicationSubmissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  ngAfterViewChecked(): void {
    // timeout is required due to the value change of isReadMoreVisible, otherwise it will error out
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()), 0);
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes
      .filter((type) => !!type.portalLabel)
      .sort((a, b) => (a.portalLabel > b.portalLabel ? 1 : -1));
    this.submissionTypes = codes.submissionTypes.sort((a, b) => (a.code > b.code ? 1 : -1));
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    const res = await this.applicationService.create(this.selectedAppType!.code);
    if (res) {
      await this.router.navigateByUrl(`/application/${res.fileId}/edit`);
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

    if (this.readMoreClicked) {
      setTimeout(() => {
        scrollToElement({ id: 'warningBanner', center: false });
      }, 300);
    }
  }

  onAppTypeSelected(event: MatRadioChange) {
    this.selectedAppType = this.applicationTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;
    setTimeout(() => {
      scrollToElement({ id: 'warningBanner', center: true });
    }, 300);
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    return el ? el.clientHeight < el.scrollHeight : false;
  }

  checkIfReadMoreVisible(): boolean {
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
