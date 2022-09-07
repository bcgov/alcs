import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';

import { DecisionComponent } from './decision.component';

describe('ReviewComponent', () => {
  let component: DecisionComponent;
  let fixture: ComponentFixture<DecisionComponent>;

  beforeEach(async () => {
    const mockAppDetailService = jasmine.createSpyObj<ApplicationDetailService>('ApplicationDetailService', [
      'loadApplication',
    ]);
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      declarations: [DecisionComponent],
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
