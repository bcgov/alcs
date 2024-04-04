import { Component, OnInit } from '@angular/core';
import {
  AdminConfigurationService,
  CONFIG_VALUE,
} from '../../../services/admin-configuration/admin-configuration.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  maintenanceBanner = false;
  maintenanceBannerMessage = '';
  maintenanceMode = false;

  constructor(private adminConfigurationService: AdminConfigurationService) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  private async onSave(configName: CONFIG_VALUE, configValue: string) {
    await this.adminConfigurationService.setConfiguration(configName, configValue);
    this.loadConfigs();
  }

  private getConfigBooleanValue(configs: { name: CONFIG_VALUE; value: string }[], configName: CONFIG_VALUE): boolean {
    const config = configs.find((config) => config.name === configName);
    return !!config && config.value === 'true';
  }

  private async loadConfigs() {
    const configs = await this.adminConfigurationService.listConfigurations();
    if (configs) {
      this.maintenanceMode = this.getConfigBooleanValue(configs, CONFIG_VALUE.PORTAL_MAINTENANCE_MODE);
      this.maintenanceBanner = this.getConfigBooleanValue(configs, CONFIG_VALUE.APP_MAINTENANCE_BANNER);
      this.maintenanceBannerMessage =
        configs.find((config) => config.name === CONFIG_VALUE.APP_MAINTENANCE_BANNER_MESSAGE)?.value || '';
    }
  }

  onToggleMaintenanceMode() {
    this.onSave(CONFIG_VALUE.PORTAL_MAINTENANCE_MODE, this.maintenanceMode.toString());
  }

  onToggleMaintenanceBanner() {
    this.onSave(CONFIG_VALUE.APP_MAINTENANCE_BANNER, this.maintenanceBanner.toString());
  }

  updateMaintenanceBannerMessage(message: string | null) {
    if (message === null) {
      message = '';
    }

    this.onSave(CONFIG_VALUE.APP_MAINTENANCE_BANNER_MESSAGE, message);
  }
}
