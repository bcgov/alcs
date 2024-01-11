import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CodeService } from '../../services/code/code.service';

import { MaintenanceComponent } from './maintenance.component';

describe('MaintenanceComponent', () => {
  let component: MaintenanceComponent;
  let fixture: ComponentFixture<MaintenanceComponent>;

  let mockCodeService: DeepMocked<CodeService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    mockCodeService = createMock();
    mockRouter = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      declarations: [MaintenanceComponent],
    });
    fixture = TestBed.createComponent(MaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
