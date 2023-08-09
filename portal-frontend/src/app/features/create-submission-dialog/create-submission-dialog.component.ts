import { AfterViewChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { ApplicationTypeDto, NoticeOfIntentTypeDto, SubmissionTypeDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';
import { NoticeOfIntentSubmissionService } from '../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { scrollToElement } from '../../shared/utils/scroll-helper';

export enum ApplicationCreateDialogStepsEnum {
  submissionType = 0,
  applicationType = 1,
  prescribedBody = 2,
  noticeOfIntentType = 3,
}

@Component({
  selector: 'app-create-application-dialog',
  templateUrl: './create-submission-dialog.component.html',
  styleUrls: ['./create-submission-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateSubmissionDialogComponent implements OnInit, AfterViewChecked {
  steps = ApplicationCreateDialogStepsEnum;

  selectedSubmissionType: SubmissionTypeDto | undefined = undefined;
  submissionTypes: SubmissionTypeDto[] = [];

  applicationTypes: ApplicationTypeDto[] = [];
  selectedAppType: ApplicationTypeDto | undefined = undefined;

  noticeOfIntentTypes: NoticeOfIntentTypeDto[] = [];
  selectedNoiType: NoticeOfIntentTypeDto | undefined = undefined;

  readMoreClicked: boolean = false;
  isReadMoreVisible: boolean = false;
  currentStep: ApplicationCreateDialogStepsEnum = this.steps.submissionType;
  prescribedBody: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<CreateSubmissionDialogComponent>,
    private codeService: CodeService,
    private appSubmissionService: ApplicationSubmissionService,
    private noiSubmissionService: NoticeOfIntentSubmissionService,
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
    this.noticeOfIntentTypes = codes.noticeOfIntentTypes.sort((a, b) => (a.portalLabel > b.portalLabel ? 1 : -1));
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmitApplication() {
    if (this.selectedAppType && this.selectedAppType.code === 'EXCL') {
      this.currentStep++;
    } else {
      await this.createApplication();
    }
  }

  async onSubmitNoi() {
    if (this.selectedAppType && this.selectedAppType.code === 'EXCL') {
      this.currentStep++;
    } else {
      await this.createNoi();
    }
  }

  async onSubmitInclExcl() {
    await this.createApplication();
  }

  private async createApplication() {
    const res = await this.appSubmissionService.create(this.selectedAppType!.code, this.prescribedBody);
    if (res) {
      await this.router.navigateByUrl(`/application/${res.fileId}/edit`);
      this.dialogRef.close(true);
    }
  }

  private async createNoi() {
    const res = await this.noiSubmissionService.create(this.selectedNoiType!.code);
    if (res) {
      await this.router.navigateByUrl(`/notice-of-intent/${res.fileId}/edit`);
      this.dialogRef.close(true);
    }
  }

  onStepChange(step: ApplicationCreateDialogStepsEnum) {
    this.currentStep = step;
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

  onNoiTypeSelected(event: MatRadioChange) {
    this.selectedNoiType = this.noticeOfIntentTypes.find((e) => e.code === event.value);
    this.readMoreClicked = false;
    setTimeout(() => {
      scrollToElement({ id: 'warningBanner', center: true });
    }, 300);
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementsByClassName(e);
    if (el.length > 0) {
      return el ? el[0].clientHeight < el[0].scrollHeight : false;
    }
    return true;
  }

  checkIfReadMoreVisible(): boolean {
    return this.readMoreClicked || this.isEllipsisActive('typeDescription');
  }

  onSelectPrescribedBody(name: string) {
    this.prescribedBody = name;
  }

  onConfirmSubmissionType() {
    if (this.selectedSubmissionType && this.selectedSubmissionType.code === 'APP') {
      this.currentStep = this.steps.applicationType;
    } else {
      this.currentStep = this.steps.noticeOfIntentType;
    }
  }
}
