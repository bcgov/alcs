import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CodeService } from '../../../services/code/code.service';

import { SelectGovernmentComponent } from './select-government.component';

describe('SelectGovernmentComponent', () => {
  let component: SelectGovernmentComponent;
  let fixture: ComponentFixture<SelectGovernmentComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockAppService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockCodeService = createMock();
    mockAppService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SelectGovernmentComponent, MatAutocomplete],
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        { provide: ApplicationService, useValue: mockAppService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGovernmentComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
