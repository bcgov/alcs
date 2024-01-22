import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { ApplicationDecisionService } from '../../../../../services/application-decision/application-decision.service';

import { DecisionsComponent } from './decisions.component';

describe('DecisionsComponent', () => {
  let component: DecisionsComponent;
  let fixture: ComponentFixture<DecisionsComponent>;
  let mockDecisionService: ApplicationDecisionService;

  beforeEach(async () => {
    mockDecisionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DecisionsComponent],
      providers: [
        {
          provide: ApplicationDecisionService,
          useValue: mockDecisionService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
