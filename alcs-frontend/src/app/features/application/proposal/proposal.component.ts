import { Component, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../shared/dto/ag-cap.types.dto';
import { SYSTEM_SOURCE_TYPES } from '../../../shared/dto/system-source.types.dto';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
})
export class ProposalComponent implements OnInit {
  application?: ApplicationDto;

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;
  alrArea: string | undefined;
  staffObservations = '';
  APPLICATION_SYSTEM_SOURCE_TYPES = SYSTEM_SOURCE_TYPES;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.application = application;
        this.alrArea = application.alrArea?.toString();
        this.staffObservations = application.staffObservations ?? '';
      }
    });
  }

  async onSaveAlrArea(value: string | null) {
    const parsedValue = value ? parseFloat(value) : null;
    await this.updateApplicationValue('alrArea', parsedValue);
  }

  async updateApplicationValue(field: keyof UpdateApplicationDto, value: string[] | string | number | null) {
    const application = this.application;
    if (application) {
      const update = await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Application updated');
      }
    }
  }

  async onSaveStaffObservations($event: string) {
    await this.updateApplicationValue('staffObservations', $event);
  }
}
