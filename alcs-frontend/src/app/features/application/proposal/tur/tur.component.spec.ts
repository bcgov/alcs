import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurProposalComponent } from './tur.component';

describe('TurComponent', () => {
  let component: TurProposalComponent;
  let fixture: ComponentFixture<TurProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurProposalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TurProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
