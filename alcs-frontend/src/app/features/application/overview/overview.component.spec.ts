import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: jasmine.createSpyObj<ApplicationDetailService>('ApplicationDetailService', ['loadApplication']),
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
