import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTypePillComponent } from './application-type-pill.component';

describe('ApplicationTypePillComponent', () => {
  let component: ApplicationTypePillComponent;
  let fixture: ComponentFixture<ApplicationTypePillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationTypePillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationTypePillComponent);
    component = fixture.componentInstance;
    component.type = {
      backgroundColor: '#fff',
      label: 'label',
      borderColor: '#fff',
      shortLabel: 'shortLabel',
      textColor: '#fff',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
