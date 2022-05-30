import { TestBed } from '@angular/core/testing';

import { PinUtilsService } from './pin-utils.service';

describe('PinUtilsService', () => {
  let service: PinUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
