import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../services/application/application-modification/application-modification.service';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';

import { ApplicationComponent } from './application.component';

describe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;

  beforeEach(async () => {
    const mockAppDetailService = jasmine.createSpyObj<ApplicationDetailService>('ApplicationDetailService', [
      'loadApplication',
    ]);
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    const mockReconsiderationService = jasmine.createSpyObj<ApplicationReconsiderationService>(
      'ApplicationReconsiderationService',
      ['fetchByApplication']
    );
    mockReconsiderationService.$reconsiderations = new BehaviorSubject<ApplicationReconsiderationDto[]>([]);

    const mockModificationService = jasmine.createSpyObj<ApplicationModificationService>(
      'ApplicationAmendmentService',
      ['fetchByApplication']
    );
    mockModificationService.$modifications = new BehaviorSubject<ApplicationModificationDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new EventEmitter(),
          },
        },
        {
          provide: Router,
          useValue: {},
        },
      ],
      declarations: [ApplicationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
