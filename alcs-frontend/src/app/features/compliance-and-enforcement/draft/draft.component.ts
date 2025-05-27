import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  firstValueFrom,
  Observable,
  skip,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import {
  ComplianceAndEnforcementDto,
  UpdateComplianceAndEnforcementDto,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { OverviewComponent } from '../overview/overview.component';
import { ToastService } from '../../../services/toast/toast.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-compliance-and-enforcement-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
})
export class DraftComponent implements OnInit, AfterViewInit, OnDestroy {
  $destroy = new Subject<void>();

  file?: ComplianceAndEnforcementDto;
  form = new FormGroup({ overview: new FormGroup({}), submitter: new FormGroup({}) });

  @ViewChild(OverviewComponent) overviewComponent?: OverviewComponent;

  constructor(
    private readonly complianceAndEnforcementService: ComplianceAndEnforcementService,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const fileNumber = this.route.snapshot.paramMap.get('fileNumber');

    if (fileNumber) {
      this.loadFile(fileNumber);
    }
  }

  ngAfterViewInit(): void {
    if (!this.overviewComponent) {
      console.warn('Not all form sections initialized');
      return;
    }

    combineLatest([this.overviewComponent.$changes])
      .pipe(
        skip(1), // Skip the initial emission to prevent save on load
        debounceTime(1000),
        switchMap(([overviewUpdate]) =>
          this.file?.uuid
            ? this.saveDraft(this.file.uuid, {
                ...overviewUpdate,
              })
            : EMPTY,
        ),
        catchError((error) => {
          console.error('Error saving C&E file draft', error);
          this.toastService.showErrorToast('Failed to save C&E file draft');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('C&E file draft saved');
      });
  }

  async loadFile(fileNumber: string) {
    try {
      this.file = await this.complianceAndEnforcementService.fetchByFileNumber(fileNumber);
      this.toastService.showSuccessToast('C&E file loaded');
    } catch (error) {
      console.error('Error loading C&E file', error);
      this.toastService.showErrorToast('Failed to load C&E file');
    }
  }

  saveDraft(uuid: string, updateDto: UpdateComplianceAndEnforcementDto): Observable<ComplianceAndEnforcementDto> {
    try {
      return this.complianceAndEnforcementService.update(uuid, updateDto);
    } catch (error) {
      console.error('Error saving C&E file draft', error);
      this.toastService.showErrorToast('Failed to save C&E file draft');
      return EMPTY;
    }
  }

  async onSaveDraftClicked() {
    if (!this.overviewComponent || !this.file?.uuid) {
      return;
    }

    const overviewUpdate = this.overviewComponent.$changes.getValue();

    await firstValueFrom(
      this.saveDraft(this.file.uuid, {
        ...overviewUpdate,
      }),
    );
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
