import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDecisionComponentLotService } from '../../../../../../services/application/decision/application-decision-v2/application-decision-component-lot/application-decision-component-lot.service';
import { ApplicationDecisionComponentService } from '../../../../../../services/application/decision/application-decision-v2/application-decision-component/application-decision-component.service';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { SubdComponent } from './subd.component';

describe('PfrsComponent', () => {
  let component: SubdComponent;
  let fixture: ComponentFixture<SubdComponent>;
  let mockComponentLotService: DeepMocked<ApplicationDecisionComponentLotService>;

  beforeEach(async () => {
    mockComponentLotService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubdComponent],
      providers: [
        {
          provide: ApplicationDecisionComponentLotService,
          useValue: mockComponentLotService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdComponent);
    component = fixture.componentInstance;
    component.component = {} as ApplicationDecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
