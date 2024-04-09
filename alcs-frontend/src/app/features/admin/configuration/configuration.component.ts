import { Component, OnInit } from '@angular/core';
import {
  AdminConfigurationService,
  CONFIG_VALUE,
} from '../../../services/admin-configuration/admin-configuration.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MaintenanceBannerConfirmationDialogComponent } from './maintenance-banner-confirmation-dialog/maintenance-banner-confirmation-dialog.component';
import { MaintenanceService } from '../../../services/maintenance/maintenance.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  maintenanceBanner = false;
  maintenanceBannerMessage = '';
  maintenanceMode = false;

  constructor(
    private dialog: MatDialog,
    private adminConfigurationService: AdminConfigurationService,
    private maintenanceService: MaintenanceService,
    protected confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  private async updateConfig(configName: CONFIG_VALUE, configValue: string) {
    await this.adminConfigurationService.setConfiguration(configName, configValue);
    this.loadConfigs();
  }

  private getConfigValue<T extends string | boolean = string>(
    configs: { name: CONFIG_VALUE; value: string }[],
    configName: CONFIG_VALUE,
    isBoolean?: T extends boolean ? true : false,
  ): T {
    const configValue = configs.find((config) => config.name === configName)?.value;
    return (isBoolean ? configValue === 'true' : configValue) as T;
  }

  private async loadConfigs() {
    const configs = await this.adminConfigurationService.listConfigurations();
    if (configs) {
      this.maintenanceMode = this.getConfigValue<boolean>(configs, CONFIG_VALUE.PORTAL_MAINTENANCE_MODE, true);
      this.maintenanceBanner = this.getConfigValue<boolean>(configs, CONFIG_VALUE.APP_MAINTENANCE_BANNER, true);
      this.maintenanceBannerMessage = this.getConfigValue(configs, CONFIG_VALUE.APP_MAINTENANCE_BANNER_MESSAGE);
    }
  }

  onToggleMaintenanceBanner(event: MatSlideToggleChange) {
    if (event.checked) {
      this.dialog
        .open(MaintenanceBannerConfirmationDialogComponent, {
          data: {
            message: this.maintenanceBannerMessage,
          },
        })
        .beforeClosed()
        .subscribe((didConfirm) => {
          if (didConfirm) {
            this.updateConfig(CONFIG_VALUE.APP_MAINTENANCE_BANNER, this.maintenanceBanner.toString());
            this.maintenanceService.setBannerMessage(this.maintenanceBannerMessage);
            this.maintenanceService.setShowBanner(true);
          } else {
            this.loadConfigs();
          }
        });
    } else {
      this.updateConfig(CONFIG_VALUE.APP_MAINTENANCE_BANNER, this.maintenanceBanner.toString());
      this.maintenanceService.setShowBanner(false);
    }
  }

  onToggleMaintenanceMode() {
    this.updateConfig(CONFIG_VALUE.PORTAL_MAINTENANCE_MODE, this.maintenanceMode.toString());
  }

  updateMaintenanceBannerMessage(message: string | null) {
    this.updateConfig(CONFIG_VALUE.APP_MAINTENANCE_BANNER_MESSAGE, message || '');

    if (this.maintenanceBanner === true) {
      this.maintenanceService.setBannerMessage(message || '');
    }
  }
}
