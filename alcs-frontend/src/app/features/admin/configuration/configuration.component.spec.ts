import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AdminConfigurationService } from '../../../services/admin-configuration/admin-configuration.service';

import { ConfigurationComponent } from './configuration.component';
import { MaintenanceService } from '../../../services/maintenance/maintenance.service';

describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;
  let mockConfigurationService: DeepMocked<AdminConfigurationService>;
  let mockMaintenanceService: DeepMocked<MaintenanceService>;

  beforeEach(async () => {
    mockConfigurationService = createMock();
    mockMaintenanceService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConfigurationComponent],
      providers: [
        {
          provide: AdminConfigurationService,
          useValue: mockConfigurationService,
        },
        {
          provide: MaintenanceService,
          useValue: mockMaintenanceService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
