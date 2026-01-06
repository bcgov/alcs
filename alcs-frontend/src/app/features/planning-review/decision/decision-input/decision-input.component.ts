import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import {
  PlanningReviewDecisionDto,
  PlanningReviewDecisionOutcomeCodeDto,
  UpdatePlanningReviewDecisionDto,
} from '../../../../services/planning-review/planning-review-decision/planning-review-decision.dto';
import { PlanningReviewDecisionService } from '../../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { PlanningReviewDetailService } from '../../../../services/planning-review/planning-review-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { ReleaseDialogComponent } from '../release-dialog/release-dialog.component';

@Component({
    selector: 'app-decision-input',
    templateUrl: './decision-input.component.html',
    styleUrls: ['./decision-input.component.scss'],
    standalone: false
})
export class DecisionInputComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  isLoading = false;
  minDate = new Date(0);
  showErrors = false;
  index = 1;
  requiresDocuments = true;

  fileNumber: string = '';
  uuid: string = '';
  outcomes: PlanningReviewDecisionOutcomeCodeDto[] = [];

  resolutionYears: number[] = [];
  existingDecision: PlanningReviewDecisionDto | undefined;

  resolutionNumberControl = new FormControl<string | null>(null, [Validators.required]);
  resolutionYearControl = new FormControl<number | null>(null, [Validators.required]);

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    resolutionNumber: this.resolutionNumberControl,
    resolutionYear: this.resolutionYearControl,
    decisionDescription: new FormControl<string | undefined>(undefined, [Validators.required]),
  });

  constructor(
    private decisionService: PlanningReviewDecisionService,
    public router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private planningReviewDetailService: PlanningReviewDetailService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.resolutionYearControl.disable();
    this.setYear();

    this.extractAndPopulateQueryParams();

    if (this.fileNumber) {
      this.loadData();
      this.setupSubscribers();
    }
  }

  private extractAndPopulateQueryParams() {
    const fileNumber = this.route.parent?.parent?.snapshot.paramMap.get('fileNumber');
    const uuid = this.route.snapshot.paramMap.get('uuid');
    const index = this.route.snapshot.paramMap.get('index');
    this.index = index ? parseInt(index) : 1;

    if (uuid) {
      this.uuid = uuid;
    }

    if (fileNumber) {
      this.fileNumber = fileNumber;
    }
  }

  private setYear() {
    const year = moment('1974');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
  }

  ngOnDestroy(): void {
    this.decisionService.clearDecision();
    this.decisionService.clearDecisions();
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadData() {
    if (this.uuid) {
      await this.decisionService.loadDecision(this.uuid);
    }

    await this.decisionService.loadDecisions(this.fileNumber);

    this.outcomes = (await this.decisionService.fetchCodes()) ?? [];
  }

  private setupSubscribers() {
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision) {
        this.existingDecision = decision;
        this.uuid = decision.uuid;
      }

      if (this.existingDecision) {
        this.patchFormWithExistingData(this.existingDecision);
      } else {
        this.resolutionYearControl.enable();
      }
    });
  }

  private patchFormWithExistingData(existingDecision: PlanningReviewDecisionDto) {
    this.form.patchValue({
      outcome: existingDecision.outcome?.code,
      date: existingDecision.date ? new Date(existingDecision.date) : undefined,
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber?.toString(10) || undefined,
      decisionDescription: existingDecision.decisionDescription,
    });

    if (!existingDecision.resolutionNumber) {
      this.resolutionYearControl.enable();
    }

    if (existingDecision.outcome?.code === 'OTHR') {
      this.requiresDocuments = false;
    }
  }

  async onSubmit(isStayOnPage: boolean = false, isDraft: boolean = true) {
    this.isLoading = true;

    try {
      await this.saveDecision(isDraft);
    } finally {
      if (!isStayOnPage) {
        this.onCancel();
      } else {
        await this.loadData();
      }

      this.isLoading = false;
    }
  }

  async saveDecision(isDraft: boolean = true) {
    const data = this.mapDecisionDataForSave(isDraft);

    if (this.uuid) {
      await this.decisionService.update(this.uuid, data);
    }
  }

  private mapDecisionDataForSave(isDraft: boolean) {
    const { date, outcome, resolutionNumber, resolutionYear, decisionDescription } = this.form.getRawValue();

    const data: UpdatePlanningReviewDecisionDto = {
      date: formatDateForApi(date!),
      resolutionNumber: parseInt(resolutionNumber!),
      resolutionYear: resolutionYear!,
      outcomeCode: outcome!,
      isDraft,
      decisionDescription: decisionDescription,
    };

    return data;
  }

  onCancel() {
    this.router.navigate([`planning-review/${this.fileNumber}/decision`]);
  }

  async onGenerateResolutionNumber() {
    const selectedYear = this.form.controls.resolutionYear.getRawValue();
    if (selectedYear) {
      const number = await this.decisionService.getNextAvailableResolutionNumber(selectedYear);
      if (number) {
        this.setResolutionNumber(number);
      } else {
        this.toastService.showErrorToast('Failed to retrieve resolution number.');
      }
    } else {
      this.toastService.showErrorToast('Resolution year is not selected. Select a resolution year first.');
    }
  }

  private async setResolutionNumber(number: number) {
    try {
      this.resolutionYearControl.disable();
      this.form.controls.resolutionNumber.setValue(number.toString());
      await this.onSubmit(true);
    } catch {
      this.resolutionYearControl.enable();
    }
  }

  async onDeleteResolutionNumber() {
    this.resolutionNumberControl.setValue(null);
    await this.onSubmit(true);
    this.resolutionYearControl.enable();
  }

  private runValidation() {
    this.form.markAllAsTouched();
    this.showErrors = true;

    if (
      !this.form.valid ||
      !this.existingDecision ||
      (this.requiresDocuments && this.existingDecision.documents.length === 0)
    ) {
      this.toastService.showErrorToast('Please correct all errors before submitting the form');

      // this will ensure that error rendering complete
      setTimeout(() => this.scrollToError());

      return false;
    } else {
      return true;
    }
  }

  private scrollToError() {
    let elements = document.getElementsByClassName('ng-invalid');
    let elArray = Array.from(elements).filter((el) => el.nodeName !== 'FORM');

    elArray[0]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  async onRelease() {
    if (this.runValidation()) {
      this.dialog
        .open(ReleaseDialogComponent, {
          minWidth: '600px',
          maxWidth: '900px',
          maxHeight: '80vh',
          width: '90%',
          autoFocus: false,
        })
        .afterClosed()
        .subscribe(async (didAccept) => {
          if (didAccept) {
            await this.onSubmit(false, false);
            await this.planningReviewDetailService.loadReview(this.fileNumber);
          }
        });
    }
  }

  onChangeDecisionOutcome(selectedOutcome: PlanningReviewDecisionOutcomeCodeDto) {
    this.requiresDocuments = selectedOutcome.code !== 'OTHR';
  }
}
