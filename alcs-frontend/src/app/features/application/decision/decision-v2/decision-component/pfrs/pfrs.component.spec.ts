import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { PfrsComponent } from './pfrs.component';

describe('PfrsComponent', () => {
  let component: PfrsComponent;
  let fixture: ComponentFixture<PfrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfrsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PfrsComponent);
    component = fixture.componentInstance;
    component.component = {} as DecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
