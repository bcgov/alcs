import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { RosoComponent } from './roso.component';

describe('RosoComponent', () => {
  let component: RosoComponent;
  let fixture: ComponentFixture<RosoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RosoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoComponent);
    component = fixture.componentInstance;
    component.component = {} as DecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
