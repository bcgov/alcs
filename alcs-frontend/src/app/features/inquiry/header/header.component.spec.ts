import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    component.inquiry = {
      dateSubmittedToAlc: 0,
      localGovernmentUuid: '',
      regionCode: '',
      summary: '',
      typeCode: '',
      fileNumber: '',
      localGovernment: {
        uuid: '',
        name: '',
        isFirstNation: false,
        preferredRegionCode: '',
      },
      open: false,
      region: {
        label: '',
        code: '',
        description: '',
      },
      type: {
        code: '',
        description: '',
        label: '',
        backgroundColor: '',
        shortLabel: '',
        textColor: '',
      },
      uuid: '',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
