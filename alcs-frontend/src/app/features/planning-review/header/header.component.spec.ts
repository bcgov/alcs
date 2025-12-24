import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [HeaderComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    component.planningReview = {
      legacyId: '',
      documentName: '',
      fileNumber: '',
      localGovernment: {
        uuid: '',
        name: '',
        isFirstNation: false,
        preferredRegionCode: '',
        isActive: true,
      },
      open: false,
      referrals: [],
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
      meetings: [],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
