import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDecisionComponent } from './post-decision.component';

describe('PostDecisionComponent', () => {
  let component: PostDecisionComponent;
  let fixture: ComponentFixture<PostDecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostDecisionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
