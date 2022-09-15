import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    const mockAppDetailService = jasmine.createSpyObj<ApplicationDetailService>('ApplicationDetailService', [
      'loadApplication',
    ]);
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationMeetingService,
          useValue: jasmine.createSpyObj<ApplicationMeetingService>('ApplicationMeetingService', ['fetch']),
        },
      ],
      declarations: [OverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
