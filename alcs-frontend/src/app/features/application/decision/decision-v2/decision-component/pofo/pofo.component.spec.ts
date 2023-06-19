import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { PofoComponent } from './pofo.component';

describe('PofoComponent', () => {
  let component: PofoComponent;
  let fixture: ComponentFixture<PofoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PofoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PofoComponent);
    component = fixture.componentInstance;
    component.component = {} as DecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
