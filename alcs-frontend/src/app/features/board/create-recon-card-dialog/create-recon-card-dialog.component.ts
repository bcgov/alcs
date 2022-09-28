import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Observable, startWith, switchMap } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { BoardService } from '../../../services/board/board.service';
import { ReconsiderationTypeDto } from '../../../services/card/card-code.dto';
import { CardService } from '../../../services/card/card.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-create-recon-card-dialog',
  templateUrl: './create-recon-card-dialog.component.html',
  styleUrls: ['./create-recon-card-dialog.component.scss'],
})
export class CreateReconCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  reconTypes: ReconsiderationTypeDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;
  hasPendingRecon = false;
  currentBoardCode: string = '';

  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]> | undefined;
  filteredApplications: Observable<ApplicationDto[]> | undefined;

  fileNumberControl = new FormControl('', [Validators.required]);

  createForm = new FormGroup({
    fileNumber: this.fileNumberControl,
    applicant: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    region: new FormControl('', [Validators.required]),
    receivedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    reconType: new FormControl('', [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateReconCardDialogComponent>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private boardService: BoardService,
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
    console.log('onApplicationSelected', $event.source.value);

    if (!$event?.source?.value) {
      return;
    }

    const application = $event.source.value as ApplicationDto;

    this.createForm.patchValue({
      applicant: application.applicant,
      region: this.regions.find((r) => r.code === application.region)?.code ?? null,
      type: this.applicationTypes.find((r) => r.code === application.type)?.code ?? null,
    });

    if (!application.decisionDate) {
      this.isDecisionDateEmpty = true;
    }

    // TODO implement hasPendingRecon once reconsideration entity created
    this.hasPendingRecon = true;
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const card = {
        boardCode: this.currentBoardCode,
        typeCode: 'RECON',
      };
      console.log('recon onSubmit', formValues, card);
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
}
