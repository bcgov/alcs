import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';
import { ApplicationService } from './application.service';

@Injectable({ providedIn: 'root' })
export class ApplicationDetailService {
  $application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

  private selectedFileNumber: string | undefined;

  constructor(private applicationService: ApplicationService, private toastService: ToastService) {}

  async loadApplication(fileNumber: string) {
    this.selectedFileNumber = fileNumber;
    const application = await this.applicationService.fetchApplication(fileNumber);
    this.$application.next(application);
  }

  async clearApplication() {
    this.$application.next(undefined);
  }

  async updateApplication(fileNumber: string, application: UpdateApplicationDto) {
    const updatedApp = await this.applicationService.updateApplication(fileNumber, application);
    if (updatedApp) {
      this.$application.next(updatedApp);
    }
    return updatedApp;
  }
}
