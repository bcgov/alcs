import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { LocalGovernmentDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';

@Component({
  selector: 'app-select-government',
  templateUrl: './select-government.component.html',
  styleUrls: ['./select-government.component.scss'],
})
export class SelectGovernmentComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;

  localGovernment = new FormControl<string | any>('');
  showWarning = false;
  selectGovernmentUuid = '';
  fileId = '';
  localGovernments: LocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<LocalGovernmentDto[]>;

  form = new FormGroup({
    localGovernment: this.localGovernment,
  });

  constructor(
    private codeService: CodeService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGovernments();

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.selectGovernmentUuid = application.localGovernmentUuid;
        this.fileId = application.fileNumber;
        this.populateLocalGovernment(application.localGovernmentUuid);
      }
    });

    this.filteredLocalGovernments = this.localGovernment.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value || ''))
    );
  }

  onChange($event: MatAutocompleteSelectedEvent) {
    const localGovernmentName = $event.option.value;
    if (localGovernmentName) {
      const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
      if (localGovernment) {
        this.showWarning = !localGovernment.hasGuid;
        this.localGovernment.setValue(localGovernment.name);
      }
    }
  }

  onBlur() {
    //Blur will fire below optionSelected
    setTimeout(() => {
      const localGovernmentName = this.localGovernment.getRawValue();
      if (localGovernmentName) {
        const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
        if (!localGovernment) {
          this.localGovernment.setValue(null);
        }
      }
    }, 100);
  }

  ngOnDestroy(): void {
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
    const localGovernmentName = this.localGovernment.getRawValue();
    if (localGovernmentName) {
      const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);

      if (localGovernment) {
        await this.applicationService.updatePending(this.fileId, {
          localGovernmentUuid: localGovernment.uuid,
        });
      }
    }
  }

  private filter(value: string): LocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.selectGovernmentUuid) {
      this.populateLocalGovernment(this.selectGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment.patchValue(lg.name);
      this.showWarning = !lg.hasGuid;
    }
  }
}
