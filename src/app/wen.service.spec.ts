import { TestBed } from '@angular/core/testing';

import { WenService } from './wen.service';

describe('WenService', () => {
  let service: WenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
