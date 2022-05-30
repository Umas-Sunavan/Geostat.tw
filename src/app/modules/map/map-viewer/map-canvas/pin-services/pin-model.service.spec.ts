import { TestBed } from '@angular/core/testing';

import { PinModelService } from './pin-model.service';

describe('PinModelService', () => {
  let service: PinModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
