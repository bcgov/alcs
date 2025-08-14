import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { detailsRoutes } from './compliance-and-enforcement.module';
import { ComplianceAndEnforcementDto } from '../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-compliance-and-enforcement',
  templateUrl: './compliance-and-enforcement.component.html',
  styleUrls: ['./compliance-and-enforcement.component.scss'],
})
export class ComplianceAndEnforcementComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  detailsRoutes = detailsRoutes;

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ComplianceAndEnforcementService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      this.file = file ?? undefined;
    });

    this.route.params.pipe(takeUntil(this.$destroy)).subscribe(async (params) => {
      const { fileNumber } = params;

      if (fileNumber) {
        this.fileNumber = fileNumber;
        this.loadFile(fileNumber);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadFile(fileNumber: string) {
    try {
      await this.service.loadFile(fileNumber, { withProperty: true });
    } catch (error) {
      console.error('Error loading file:', error);
      this.toastService.showErrorToast('Failed to load file');
    }
  }
}
