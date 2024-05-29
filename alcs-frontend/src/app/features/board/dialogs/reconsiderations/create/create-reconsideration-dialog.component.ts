import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import {
  CreateApplicationReconsiderationDto,
  ReconsiderationTypeDto,
} from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { CardService } from '../../../../../services/card/card.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { parseStringToBoolean } from '../../../../../shared/utils/boolean-helper';
import { MinimalBoardDto } from '../../../../../services/board/board.dto';
import { BoardService } from '../../../../../services/board/board.service';

@Component({
  selector: 'app-create',
  templateUrl: './create-reconsideration-dialog.html',
  styleUrls: ['./create-reconsideration-dialog.component.scss'],
})
export class CreateReconsiderationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationTypes: ApplicationTypeDto[] = [];
  boards: MinimalBoardDto[] = [];
  reconTypes: ReconsiderationTypeDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;

  decisions: { uuid: string; resolution: string }[] = [];

  fileNumberControl = new FormControl<string | any>({ value: '', disabled: true }, [Validators.required]);
  applicantControl = new FormControl({ value: '', disabled: true }, [Validators.required]);
  applicationTypeControl = new FormControl<string | null>(null, [Validators.required]);
  boardControl = new FormControl<string | null>(null, [Validators.required]);
  regionControl = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  reconTypeControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  reconsidersDecisions = new FormControl<string[]>([], [Validators.required]);
  descriptionControl = new FormControl<string | null>('', [Validators.required]);
  isNewProposalControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isIncorrectFalseInfoControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isNewEvidenceControl = new FormControl<string | undefined>(undefined, [Validators.required]);

  createForm: FormGroup = new FormGroup({
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    applicationType: this.applicationTypeControl,
    board: this.boardControl,
    submittedDate: this.submittedDateControl,
    reconType: this.reconTypeControl,
    reconsidersDecisions: this.reconsidersDecisions,
    description: this.descriptionControl,
    isNewProposal: this.isNewProposalControl,
    isIncorrectFalseInfo: this.isIncorrectFalseInfoControl,
    isNewEvidence: this.isNewEvidenceControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateReconsiderationDialogComponent>,
    private applicationService: ApplicationService,
    private boardService: BoardService,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private toastService: ToastService,
    private decisionService: ApplicationDecisionV2Service,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.createForm.patchValue({
      fileNumber: this.data.fileNumber,
      applicant: this.data.applicant,
      localGovernment: this.data.localGovernment?.name,
      region: this.data.region?.label,
    });

    this.applicationService.fetchApplication(this.data.fileNumber).then((application) => {
      if (!application.decisionDate) {
        this.isDecisionDateEmpty = true;
      }
    });

    this.applicationService.$applicationTypes.pipe(takeUntil(this.$destroy)).subscribe((types) => {
      this.applicationTypes = types;
    });

    this.boardService.$boards.subscribe((boards) => {
      this.boards = boards.sort((a, b) => (a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1));
    });

    this.applicationService.$applicationTypes.pipe(takeUntil(this.$destroy)).subscribe((types) => {
      this.applicationTypes = types;
    });

    this.cardService.fetchCodes();
    this.cardService.$cardReconTypes.pipe(takeUntil(this.$destroy)).subscribe((reconTypes) => {
      this.reconTypes = reconTypes;
    });

    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const recon: CreateApplicationReconsiderationDto = {
        // application details
        applicationTypeCode: formValues.applicationType!,
        applicationFileNumber: formValues.fileNumber!.fileNumber?.trim() ?? formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        // recon details
        submittedDate: formValues.submittedDate!,
        reconTypeCode: formValues.reconType!,
        // card details
        boardCode: formValues.board,
        reconsideredDecisionUuids: formValues.reconsidersDecisions!,
        description: formValues.description,
        isNewProposal: parseStringToBoolean(formValues.isNewProposal),
        isIncorrectFalseInfo: parseStringToBoolean(formValues.isIncorrectFalseInfo),
        isNewEvidence: parseStringToBoolean(formValues.isNewEvidence),
      };

      if (!recon.boardCode) {
        this.toastService.showErrorToast('Board is required, please reload the page and try again');
        return;
      }

      const res = await this.reconsiderationService.create(recon);
      if (res) {
        await this.router.navigate(this.activatedRoute.snapshot.url, {
          queryParams: res.card.uuid && res.card.type ? { card: res.card.uuid, type: res.card.type } : {},
          relativeTo: this.activatedRoute,
        });
      }
      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Reconsideration card created');
    } finally {
      this.isLoading = false;
    }
  }

  onReset(event: MouseEvent) {
    event.preventDefault();

    this.applicationTypeControl.reset();
    this.boardControl.reset();
    this.submittedDateControl.reset();
    this.reconTypeControl.reset();
    this.reconsidersDecisions.reset();
    this.descriptionControl.reset();
    this.isIncorrectFalseInfoControl.reset();
    this.isNewEvidenceControl.reset();
    this.isNewProposalControl.reset();
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions
        .filter((e) => !e.isDraft)
        .map((decision) => ({
          uuid: decision.uuid,
          resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
        }));
      this.reconsidersDecisions.enable();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
