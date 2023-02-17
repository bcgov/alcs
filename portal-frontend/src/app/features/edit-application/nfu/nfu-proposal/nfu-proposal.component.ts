import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDetailedDto, ApplicationUpdateDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';

@Component({
  selector: 'app-nfu-proposal',
  templateUrl: './nfu-proposal.component.html',
  styleUrls: ['./nfu-proposal.component.scss'],
})
export class NfuProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;

  hectares = new FormControl<number | null>(null);
  purpose = new FormControl<string | null>(null);
  outsideLands = new FormControl<string | null>(null);
  agricultureSupport = new FormControl<string | null>(null);
  willImportFill = new FormControl<string | null>(null);
  totalFillPlacement = new FormControl<number | null>(null);
  maxFillDepth = new FormControl<number | null>(null);
  fillVolume = new FormControl<number | null>(null);
  projectDurationYears = new FormControl<number | null>(null);
  projectDurationMonths = new FormControl<number | null>(null);
  fillTypeDescription = new FormControl<string | null>(null);
  fillOriginDescription = new FormControl<string | null>(null);

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    outsideLands: this.outsideLands,
    agricultureSupport: this.agricultureSupport,
    willImportFill: this.willImportFill,
    totalFillPlacement: this.totalFillPlacement,
    maxFillDepth: this.maxFillDepth,
    fillVolume: this.fillVolume,
    projectDurationYears: this.projectDurationYears,
    projectDurationMonths: this.projectDurationMonths,
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
          hectares: application.nfuHectares,
          purpose: application.nfuPurpose,
          outsideLands: application.nfuOutsideLands,
          agricultureSupport: application.nfuAgricultureSupport,
          totalFillPlacement: application.nfuTotalFillPlacement,
          maxFillDepth: application.nfuMaxFillDepth,
          fillVolume: application.nfuFillVolume,
          projectDurationYears: application.nfuProjectDurationYears,
          projectDurationMonths: application.nfuProjectDurationMonths,
          fillTypeDescription: application.nfuFillTypeDescription,
          fillOriginDescription: application.nfuFillOriginDescription,
        });

        if (application.nfuWillImportFill !== null) {
          this.willImportFill.setValue(application.nfuWillImportFill ? 'true' : 'false');
        }
      }
    });
  }

  async ngOnDestroy() {
    await this.onSave();
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveExit() {
    await this.save();
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
      const nfuProjectDurationYears = this.projectDurationYears.getRawValue();
      const nfuProjectDurationMonths = this.projectDurationMonths.getRawValue();
      const nfuFillTypeDescription = this.fillTypeDescription.getRawValue();
      const nfuFillOriginDescription = this.fillOriginDescription.getRawValue();

      const updateDto: ApplicationUpdateDto = {
        nfuHectares,
        nfuPurpose,
        nfuOutsideLands,
        nfuAgricultureSupport,
        nfuWillImportFill: parseStringToBoolean(nfuWillImportFill),
        nfuTotalFillPlacement,
        nfuMaxFillDepth,
        nfuFillVolume,
        nfuProjectDurationYears,
        nfuProjectDurationMonths,
        nfuFillTypeDescription,
        nfuFillOriginDescription,
      };

      const updatedApp = await this.applicationService.updatePending(this.fileId, updateDto);
      this.$application.next(updatedApp);
    }
  }

  onChangeFill($event: MatButtonToggleChange) {
    const value = $event.value;
    if (value === 'true') {
      this.totalFillPlacement.enable();
      this.maxFillDepth.enable();
      this.fillVolume.enable();
      this.projectDurationYears.enable();
      this.projectDurationMonths.enable();
      this.fillTypeDescription.enable();
      this.fillOriginDescription.enable();
    } else {
      this.totalFillPlacement.disable();
      this.maxFillDepth.disable();
      this.fillVolume.disable();
      this.projectDurationYears.disable();
      this.projectDurationMonths.disable();
      this.fillTypeDescription.disable();
      this.fillOriginDescription.disable();

      this.totalFillPlacement.setValue(null);
      this.maxFillDepth.setValue(null);
      this.fillVolume.setValue(null);
      this.projectDurationYears.setValue(null);
      this.projectDurationMonths.setValue(null);
      this.fillTypeDescription.setValue(null);
      this.fillOriginDescription.setValue(null);
    }
  }
}
