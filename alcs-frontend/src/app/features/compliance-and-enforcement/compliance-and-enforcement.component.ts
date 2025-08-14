import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { detailsRoutes } from './compliance-and-enforcement.module';
import { ComplianceAndEnforcementDto } from '../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../services/compliance-and-enforcement/compliance-and-enforcement.service';

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
    private route: ActivatedRoute,
    private service: ComplianceAndEnforcementService,
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
    await this.service.loadFile(fileNumber, { withProperty: true });
  }
}
