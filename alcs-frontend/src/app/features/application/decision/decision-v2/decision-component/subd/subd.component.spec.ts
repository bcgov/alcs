import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { SubdComponent } from './subd.component';

describe('PfrsComponent', () => {
  let component: SubdComponent;
  let fixture: ComponentFixture<SubdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubdComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdComponent);
    component = fixture.componentInstance;
    component.component = {} as DecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
