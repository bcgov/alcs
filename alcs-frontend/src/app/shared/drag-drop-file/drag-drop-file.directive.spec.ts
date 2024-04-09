import { DomSanitizer } from '@angular/platform-browser';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { DragDropDirective } from './drag-drop-file.directive';

describe('DragDropDirective', () => {
  let directive: DragDropDirective;
  let sanitizer: DeepMocked<DomSanitizer>;

  beforeEach(() => {
    sanitizer = createMock();
    sanitizer.bypassSecurityTrustUrl.mockReturnValue('mock');
    directive = new DragDropDirective(sanitizer);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
