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
  maintenanceMode = false;

  constructor(private adminConfigurationService: AdminConfigurationService) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  async onSave() {
    await this.adminConfigurationService.setConfiguration(
      CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
      this.maintenanceMode.toString(),
    );
    this.loadConfigs();
  }

  private async loadConfigs() {
    const configs = await this.adminConfigurationService.listConfigurations();
    if (configs) {
      const maintenanceConfig = configs.find((config) => config.name === CONFIG_VALUE.PORTAL_MAINTENANCE_MODE);
      this.maintenanceMode = maintenanceConfig ? maintenanceConfig.value === 'true' : false;
    }
  }

  onToggleMaintenanceMode() {
    this.onSave();
  }
}
