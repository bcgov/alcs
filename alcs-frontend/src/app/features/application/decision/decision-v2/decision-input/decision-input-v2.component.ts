import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subject } from 'rxjs';
import { ApplicationDetailService } from '../../../../../services/application/application-detail.service';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../../../../services/application/application.dto';
import {
  ApplicationDecisionDto,
  CeoCriterion,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionMaker,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { DocumentUploadDialogComponent } from '../../../documents/document-upload-dialog/document-upload-dialog.component';

// TODO export this into generic location for V1 and V2
export enum PostDecisionType {
  Modification = 'modification',
  Reconsideration = 'reconsideration',
}

// TODO export this into generic location for V1 and V2
type MappedPostDecision = {
  label: string;
  uuid: string;
  type: PostDecisionType;
};

@Component({
  selector: 'app-decision-input',
  templateUrl: './decision-input-v2.component.html',
  styleUrls: ['./decision-input-v2.component.scss'],
})
export class DecisionInputV2Component implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  isLoading = false;
  isEdit = false;
  minDate = new Date(0);

  fileNumber: string = '';
  uuid: string = '';
  application: ApplicationDto | undefined;
  outcomes: DecisionOutcomeCodeDto[] = [];
  decisionMakers: DecisionMakerDto[] = [];
  ceoCriterion: CeoCriterionDto[] = [];
  isFirstDecision = true;

  resolutionYears: number[] = [];
  postDecisions: MappedPostDecision[] = [];
  // populate this one
  existingDecision: ApplicationDecisionDto | undefined;

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    postDecision: new FormControl<string | null>(null),
    resolutionNumber: new FormControl<string | null>(null, [Validators.required]),
    resolutionYear: new FormControl<number | null>(null, [Validators.required]),
    chairReviewRequired: new FormControl<string>('true', [Validators.required]),
    chairReviewDate: new FormControl<Date | null>(null),
    chairReviewOutcome: new FormControl<string | null>(null),
    auditDate: new FormControl<Date | null>(null),
    criterionModification: new FormControl<string[]>([]),
    ceoCriterion: new FormControl<string | null>(null),
    isSubjectToConditions: new FormControl<string | undefined>(undefined, [Validators.required]),
    decisionDescription: new FormControl<string | undefined>(undefined, [Validators.required]),
    isStatsRequired: new FormControl<string | undefined>(undefined, [Validators.required]),
    daysHideFromPublic: new FormControl<number>(2, [Validators.required]),
    rescindedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    rescindedComment: new FormControl<string | undefined>(undefined, [Validators.required]),
  });

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    private applicationDetailService: ApplicationDetailService,
    public dialog: MatDialog,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const year = moment('1974');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
    if (!this.isEdit) {
      this.form.patchValue({
        resolutionYear: currentYear,
      });
    }

    const fileNumber = this.route.parent?.parent?.snapshot.paramMap.get('fileNumber');
    const uuid = this.route.snapshot.paramMap.get('uuid');
    const isFirst = this.route.snapshot.paramMap.get('isFirstDecision');

    console.log(fileNumber, uuid, this.isFirstDecision);
    this.isFirstDecision = isFirst ? parseStringToBoolean(isFirst)! : true;

    if (uuid) {
      this.uuid = uuid;
      this.isEdit = true;
    }

    if (fileNumber) {
      this.fileNumber = fileNumber;
      this.loadData(this.fileNumber);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadData(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    this.outcomes = codes.outcomes;
    this.decisionMakers = codes.decisionMakers;
    this.ceoCriterion = codes.ceoCriterion;

    if (this.isEdit) {
      this.existingDecision = await this.decisionService.getByUuid(this.uuid);
    }
  }

  onSelectDecisionMaker(decisionMaker: DecisionMakerDto) {
    if (decisionMaker.code === DecisionMaker.CEO) {
      this.form.controls['ceoCriterion'].setValidators([Validators.required]);
    } else {
      this.form.patchValue({
        ceoCriterion: null,
        criterionModification: [],
      });
      this.form.controls['ceoCriterion'].clearValidators();
    }
    this.form.controls['ceoCriterion'].updateValueAndValidity();
  }

  onSelectCeoCriterion(ceoCriterion: CeoCriterionDto) {
    if (ceoCriterion.code === CeoCriterion.MODIFICATION) {
      this.form.controls['criterionModification'].setValidators([Validators.required]);
    } else {
      this.form.patchValue({
        criterionModification: [],
      });
      this.form.controls['criterionModification'].clearValidators();
    }
    this.form.controls['criterionModification'].updateValueAndValidity();
  }

  async onSubmit() {
    this.isLoading = true;

    const {
      date,
      outcome,
      decisionMaker,
      resolutionNumber,
      resolutionYear,
      ceoCriterion,
      criterionModification,
      chairReviewRequired,
      auditDate,
      chairReviewDate,
      chairReviewOutcome,
      postDecision,
      isSubjectToConditions,
      decisionDescription,
      isStatsRequired,
      daysHideFromPublic,
      rescindedDate,
      rescindedComment,
    } = this.form.getRawValue();

    const selectedDecision = this.postDecisions.find((postDec) => postDec.uuid === postDecision);
    const isPostDecisionReconsideration =
      selectedDecision && selectedDecision.type === PostDecisionType.Reconsideration;

    const data: CreateApplicationDecisionDto = {
      date: formatDateForApi(date!),
      resolutionNumber: parseInt(resolutionNumber!),
      resolutionYear: resolutionYear!,
      chairReviewRequired: chairReviewRequired === 'true',
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      chairReviewDate: chairReviewDate ? formatDateForApi(chairReviewDate) : chairReviewDate,
      outcomeCode: outcome!,
      decisionMakerCode: decisionMaker,
      ceoCriterionCode: ceoCriterion,
      chairReviewOutcomeCode: chairReviewOutcome,
      applicationFileNumber: this.fileNumber,
      modifiesUuid: isPostDecisionReconsideration ? null : postDecision!,
      reconsidersUuid: isPostDecisionReconsideration ? postDecision! : null,
      isDraft: true,
      isSubjectToConditions: parseStringToBoolean(isSubjectToConditions),
      decisionDescription: decisionDescription,
      isStatsRequired: parseStringToBoolean(isStatsRequired),
      daysHideFromPublic: daysHideFromPublic,
      rescindedDate: rescindedDate ? formatDateForApi(rescindedDate) : rescindedDate,
      rescindedComment: rescindedComment,
    };
    if (ceoCriterion && ceoCriterion === CeoCriterion.MODIFICATION) {
      data.isTimeExtension = criterionModification?.includes('isTimeExtension');
      data.isOther = criterionModification?.includes('isOther');
    } else {
      data.isTimeExtension = null;
      data.isOther = null;
    }

    try {
      if (this.existingDecision) {
        await this.decisionService.update(this.existingDecision.uuid, data);
      } else {
        await this.decisionService.create({
          ...data,
          applicationFileNumber: this.fileNumber,
        });
      }
    } finally {
      this.isLoading = false;
      // TODO uncomment this once feature is ready
      // this.onCancel();
    }
  }

  onSelectPostDecision(postDecision: { type: PostDecisionType }) {
    if (postDecision.type === PostDecisionType.Modification) {
      // this.form.controls.ceoCriterion.disable();
      this.form.controls.outcome.disable();
      this.form.controls.decisionMaker.disable();
      this.ceoCriterion = this.ceoCriterion.filter((ceoCriterion) => ceoCriterion.code === CeoCriterion.MODIFICATION);
      this.form.patchValue({
        decisionMaker: DecisionMaker.CEO,
        // ceoCriterion: CeoCriterion.MODIFICATION,
        outcome: 'VARY',
      });
    } else {
      this.form.controls.decisionMaker.enable();
      this.form.controls.outcome.enable();
      // this.form.controls.ceoCriterion.enable();
      this.ceoCriterion = this.ceoCriterion.filter((ceoCriterion) => ceoCriterion.code !== CeoCriterion.MODIFICATION);
    }
  }

  onSelectChairReviewRequired($event: MatButtonToggleChange) {
    if ($event.value === 'false') {
      this.form.patchValue({
        chairReviewOutcome: null,
        chairReviewDate: null,
      });
    }
  }

  async onUploadFile() {
    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileId: this.fileNumber,
        },
      })
      .beforeClosed()
      .subscribe((isDirty) => {
        if (isDirty) {
          // load decision document once it is uploaded
          // this.loadDocuments(this.fileId);
        }
      });
  }

  onCancel() {
    this.router.navigate([`application/${this.fileNumber}/decision`]);
  }
}
