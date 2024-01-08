import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AdminConfigurationService } from '../../../services/admin-configuration/admin-configuration.service';
import { UnarchiveCardService } from '../../../services/unarchive-card/unarchive-card.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { ConfigurationComponent } from './configuration.component';

describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;
  let mockConfigurationService: DeepMocked<AdminConfigurationService>;

  beforeEach(async () => {
    mockConfigurationService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConfigurationComponent],
      providers: [
        {
          provide: AdminConfigurationService,
          useValue: mockConfigurationService,
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
