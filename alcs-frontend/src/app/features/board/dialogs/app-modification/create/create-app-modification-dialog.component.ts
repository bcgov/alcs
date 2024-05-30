import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import { ApplicationModificationCreateDto } from '../../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create-app-modification-dialog.html',
  styleUrls: ['./create-app-modification-dialog.component.scss'],
})
export class CreateAppModificationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationTypes: ApplicationTypeDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;

  decisions: { uuid: string; resolution: string }[] = [];

  fileNumberControl = new FormControl<string | any>({ value: '', disabled: true }, [Validators.required]);
  applicantControl = new FormControl({ value: '', disabled: true }, [Validators.required]);
  descriptionControl = new FormControl<string | null>(null, [Validators.required]);
  applicationTypeControl = new FormControl<string | null>(null, [Validators.required]);
  regionControl = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  isTimeExtensionControl = new FormControl<string>('true', [Validators.required]);
  modifiesDecisions = new FormControl<string[]>([], [Validators.required]);

  createForm = new FormGroup({
    applicationType: this.applicationTypeControl,
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    region: this.regionControl,
    description: this.descriptionControl,
    localGovernment: this.localGovernmentControl,
    submittedDate: this.submittedDateControl,
    isTimeExtension: this.isTimeExtensionControl,
    modifiesDecisions: this.modifiesDecisions,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateAppModificationDialogComponent>,
    private applicationService: ApplicationService,
    private modificationService: ApplicationModificationService,
    private decisionService: ApplicationDecisionV2Service,
    private toastService: ToastService,
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

    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const modificationCreateDto: ApplicationModificationCreateDto = {
        // application details
        applicationTypeCode: formValues.applicationType!,
        applicationFileNumber: formValues.fileNumber!.fileNumber?.trim() ?? formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        // modification details
        submittedDate: formValues.submittedDate!.valueOf(),
        boardCode: 'ceo',
        isTimeExtension: formValues.isTimeExtension === 'true',
        modifiesDecisionUuids: formValues.modifiesDecisions!,
        description: formValues.description!,
      };

      if (!modificationCreateDto.boardCode) {
        this.toastService.showErrorToast('Board is required, please reload the page and try again');
        return;
      }

      const res = await this.modificationService.create(modificationCreateDto);
      this.dialogRef.close(true);
      if (res) {
        await this.router.navigate(this.activatedRoute.snapshot.url, {
          queryParams: res.card.uuid && res.card.type ? { card: res.card.uuid, type: res.card.type } : {},
          relativeTo: this.activatedRoute,
        });
      }
      this.toastService.showSuccessToast('Modification card created');
    } finally {
      this.isLoading = false;
    }
  }

  onReset(event: MouseEvent) {
    event.preventDefault();

    this.applicationTypeControl.reset();
    this.submittedDateControl.reset();
    this.modifiesDecisions.reset();
    this.descriptionControl.reset();
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
      this.modifiesDecisions.enable();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
