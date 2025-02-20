import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionConditionFinancialInstrumentComponent } from './decision-condition-financial-instrument.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpClient } from '@angular/common/http';
import { DecisionConditionFinancialInstrumentService } from '../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';

describe('DecisionConditionFinancialInstrumentComponent', () => {
  let component: DecisionConditionFinancialInstrumentComponent;
  let fixture: ComponentFixture<DecisionConditionFinancialInstrumentComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockFinancialInstrumentService: DeepMocked<DecisionConditionFinancialInstrumentService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockFinancialInstrumentService = createMock();
    await TestBed.configureTestingModule({
      declarations: [DecisionConditionFinancialInstrumentComponent],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: DecisionConditionFinancialInstrumentService, useValue: mockFinancialInstrumentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionFinancialInstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
