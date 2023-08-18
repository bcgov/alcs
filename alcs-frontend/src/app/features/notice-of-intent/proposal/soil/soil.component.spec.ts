import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoilProposalComponent } from './soil.component';

describe('SoilComponent', () => {
  let component: SoilProposalComponent;
  let fixture: ComponentFixture<SoilProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoilProposalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoilProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
