import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import {
  ComplianceAndEnforcementService,
  DEFAULT_C_AND_E_FETCH_OPTIONS,
  FetchOptions,
} from '../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ResponsiblePartyType } from '../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import { ResponsiblePartiesService } from '../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ToastService } from '../../services/toast/toast.service';
import { detailsRoutes } from './compliance-and-enforcement.module';

@Component({
    selector: 'app-compliance-and-enforcement',
    templateUrl: './compliance-and-enforcement.component.html',
    styleUrls: ['./compliance-and-enforcement.component.scss'],
    standalone: false
})
export class ComplianceAndEnforcementComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  detailsRoutes = detailsRoutes;

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;
  propertyOwnerName?: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementService,
    private readonly responsiblePartyService: ResponsiblePartiesService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      this.file = file ?? undefined;
    });

    this.router.events.pipe(takeUntil(this.$destroy)).subscribe((event) => {
      if (event instanceof NavigationEnd && this.fileNumber) {
        this.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
      }
    });

    this.route.params.pipe(takeUntil(this.$destroy)).subscribe(async (params) => {
      const { fileNumber } = params;

      if (fileNumber) {
        this.fileNumber = fileNumber;
        this.loadFile(fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadFile(fileNumber: string, options?: FetchOptions) {
    try {
      await this.service.loadFile(fileNumber, options);

      if (this.file) {
        const owners = await this.responsiblePartyService.fetchByFileNumber(
          fileNumber,
          ResponsiblePartyType.PROPERTY_OWNER,
        );
        
        const isCrown = this.file?.property?.ownershipTypeCode === 'CRWN';

        if (isCrown) {

          if (owners && owners.length > 0) {
            this.propertyOwnerName = 'Crown et al.';
          } else {
            this.propertyOwnerName = 'Crown';
          }
        } else {
          this.propertyOwnerName =
            owners && owners.length > 0
              ? (owners[0].organizationName || owners[0].individualName) + (owners.length > 1 ? ' et al.' : '')
              : '';
        }
      }
    } catch (error) {
      console.error('Error loading file:', error);
      this.toastService.showErrorToast('Failed to load file');
    }
  }
}
