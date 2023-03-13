import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDetailedDto, ApplicationUpdateDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-application.component';

@Component({
  selector: 'app-nfu-proposal',
  templateUrl: './nfu-proposal.component.html',
  styleUrls: ['./nfu-proposal.component.scss'],
})
export class NfuProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  currentStep = EditApplicationSteps.Proposal;
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Input() showErrors = false;
  @Output() navigateToStep = new EventEmitter<number>();

  hectares = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  outsideLands = new FormControl<string | null>(null, [Validators.required]);
  agricultureSupport = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<string | null>(null, [Validators.required]);
  totalFillPlacement = new FormControl<string | null>(null, [Validators.required]);
  maxFillDepth = new FormControl<string | null>(null, [Validators.required]);
  fillVolume = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);
  fillTypeDescription = new FormControl<string | null>(null, [Validators.required]);
  fillOriginDescription = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    outsideLands: this.outsideLands,
    agricultureSupport: this.agricultureSupport,
    willImportFill: this.willImportFill,
    totalFillPlacement: this.totalFillPlacement,
    maxFillDepth: this.maxFillDepth,
    fillVolume: this.fillVolume,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
    fillTypeDescription: this.fillTypeDescription,
    fillOriginDescription: this.fillOriginDescription,
  });
  private fileId: string | undefined;

  constructor(private router: Router, private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;

        this.form.patchValue({
          hectares: application.nfuHectares?.toString(),
          purpose: application.nfuPurpose,
          outsideLands: application.nfuOutsideLands,
          agricultureSupport: application.nfuAgricultureSupport,
          totalFillPlacement: application.nfuTotalFillPlacement?.toString(),
          maxFillDepth: application.nfuMaxFillDepth?.toString(),
          fillVolume: application.nfuFillVolume?.toString(),
          projectDurationAmount: application.nfuProjectDurationAmount?.toString(),
          projectDurationUnit: application.nfuProjectDurationUnit,
          fillTypeDescription: application.nfuFillTypeDescription,
          fillOriginDescription: application.nfuFillOriginDescription,
        });

        if (application.nfuWillImportFill !== null) {
          this.willImportFill.setValue(application.nfuWillImportFill ? 'true' : 'false');
          this.onChangeFill(application.nfuWillImportFill ? 'true' : 'false');
        }

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveExit() {
    await this.router.navigateByUrl(`/application/${this.fileId}`);
  }

  async onSave() {
    await this.save();
  }

  private async save() {
    if (this.fileId) {
      const nfuHectares = this.hectares.getRawValue();
      const nfuPurpose = this.purpose.getRawValue();
      const nfuOutsideLands = this.outsideLands.getRawValue();
      const nfuAgricultureSupport = this.agricultureSupport.getRawValue();
      const nfuWillImportFill = this.willImportFill.getRawValue();
      const nfuTotalFillPlacement = this.totalFillPlacement.getRawValue();
      const nfuMaxFillDepth = this.maxFillDepth.getRawValue();
      const nfuFillVolume = this.fillVolume.getRawValue();
      const nfuProjectDurationAmount = this.projectDurationAmount.getRawValue();
      const nfuProjectDurationUnit = this.projectDurationUnit.getRawValue();
      const nfuFillTypeDescription = this.fillTypeDescription.getRawValue();
      const nfuFillOriginDescription = this.fillOriginDescription.getRawValue();

      const updateDto: ApplicationUpdateDto = {
        nfuHectares: nfuHectares ? parseFloat(nfuHectares) : null,
        nfuPurpose,
        nfuOutsideLands,
        nfuAgricultureSupport,
        nfuWillImportFill: parseStringToBoolean(nfuWillImportFill),
        nfuTotalFillPlacement: nfuTotalFillPlacement ? parseFloat(nfuTotalFillPlacement) : null,
        nfuMaxFillDepth: nfuMaxFillDepth ? parseFloat(nfuMaxFillDepth) : null,
        nfuFillVolume: nfuFillVolume ? parseFloat(nfuFillVolume) : null,
        nfuProjectDurationAmount: nfuProjectDurationAmount ? parseFloat(nfuProjectDurationAmount) : null,
        nfuProjectDurationUnit,
        nfuFillTypeDescription,
        nfuFillOriginDescription,
      };

      const updatedApp = await this.applicationService.updatePending(this.fileId, updateDto);
      this.$application.next(updatedApp);
    }
  }

  onChangeFill(value: string) {
    if (value === 'true') {
      this.totalFillPlacement.enable();
      this.maxFillDepth.enable();
      this.fillVolume.enable();
      this.projectDurationAmount.enable();
      this.projectDurationUnit.enable();
      this.fillTypeDescription.enable();
      this.fillOriginDescription.enable();
    } else {
      this.totalFillPlacement.disable();
      this.maxFillDepth.disable();
      this.fillVolume.disable();
      this.projectDurationAmount.disable();
      this.projectDurationUnit.disable();
      this.fillTypeDescription.disable();
      this.fillOriginDescription.disable();

      this.totalFillPlacement.setValue(null);
      this.maxFillDepth.setValue(null);
      this.fillVolume.setValue(null);
      this.projectDurationAmount.setValue(null);
      this.projectDurationUnit.setValue(null);
      this.fillTypeDescription.setValue(null);
      this.fillOriginDescription.setValue(null);
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
