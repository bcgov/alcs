import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Observable, startWith, switchMap } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ReconsiderationTypeDto } from '../../../services/card/card.dto';
import { CardService } from '../../../services/card/card.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-recon-create-card-dialog',
  templateUrl: './recon-create-card-dialog.component.html',
  styleUrls: ['./recon-create-card-dialog.component.scss'],
})
export class ReconCreateCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  reconTypes: ReconsiderationTypeDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;
  hasPendingRecon = false;
  currentBoardCode: string = '';

  filteredApplications: Observable<ApplicationDto[]> | undefined;

  fileNumberControl = new FormControl('', [Validators.required]);
  applicantControl = new FormControl('', [Validators.required]);
  typeControl = new FormControl<string | null>(null, [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  receivedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  reconTypeControl = new FormControl<string | null>(null, [Validators.required]);

  createForm = new FormGroup({
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    type: this.typeControl,
    region: this.regionControl,
    receivedDate: this.receivedDateControl,
    reconType: this.reconTypeControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ReconCreateCardDialogComponent>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentBoardCode = this.data.currentBoardCode;
    this.cardService.fetchCodes();
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applicationRegions.subscribe((regions) => {
      this.regions = regions;
    });

    this.cardService.$cardReconTypes.subscribe((reconTypes) => {
      this.reconTypes = reconTypes;
    });

    this.initApplicationFileNumberAutocomplete();
  }

  initApplicationFileNumberAutocomplete() {
    this.filteredApplications = this.fileNumberControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((val) => {
        if (val && val.length > 1) {
          return this.applicationService.searchApplicationsByNumber(val);
        }
        return [];
      })
    );
  }

  autocompleteDisplay(application: ApplicationDto): string {
    return (application && application.fileNumber) ?? '';
  }

  async onApplicationSelected($event: MatOptionSelectionChange) {
    if (!$event?.source?.value) {
      return;
    }

    const application = $event.source.value as ApplicationDto;

    this.fileNumberControl.disable();
    this.applicantControl.disable();
    this.regionControl.disable();
    this.typeControl.disable();

    this.createForm.patchValue({
      applicant: application.applicant,
      region: this.regions.find((r) => r.code === application.region)?.code ?? null,
      type: this.applicationTypes.find((r) => r.code === application.type)?.code ?? null,
    });

    if (!application.decisionDate) {
      this.isDecisionDateEmpty = true;
    }

    // TODO implement hasPendingRecon once reconsideration entity created
    // this.hasPendingRecon = true;
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const card = {
        boardCode: this.currentBoardCode,
        typeCode: 'RECON',
      };

      if (!card.boardCode) {
        this.toastService.showErrorToast('Board is required. Please reload the page and try again.');
        return;
      }

      await this.cardService.createCard(card);

      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Reconsideration card created');
    } finally {
      this.isLoading = false;
    }
  }

  onReset() {
    this.fileNumberControl.reset();
    this.applicantControl.reset();
    this.regionControl.reset();
    this.typeControl.reset();
    this.receivedDateControl.reset();
    this.reconTypeControl.reset();

    this.fileNumberControl.enable();
    this.applicantControl.enable();
    this.regionControl.enable();
    this.typeControl.enable();

    // clear warnings
    this.isDecisionDateEmpty = false;
    this.hasPendingRecon = false;
  }
}
