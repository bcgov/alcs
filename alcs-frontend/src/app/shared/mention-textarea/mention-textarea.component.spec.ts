import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentionTextareaComponent } from './mention-textarea.component';

describe('MentionTextareaComponent', () => {
  let component: MentionTextareaComponent;
  let fixture: ComponentFixture<MentionTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MentionTextareaComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MentionTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
