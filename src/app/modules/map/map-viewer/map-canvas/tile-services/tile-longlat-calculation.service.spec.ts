import { TestBed } from '@angular/core/testing';

import { TileLonglatCalculationService } from './tile-longlat-calculation.service';

describe('TileLonglatCalculationService', () => {
  let service: TileLonglatCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TileLonglatCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
