import { TestBed } from '@angular/core/testing';

import { PinsTableService } from './pins-table.service';

describe('PointDataService', () => {
  let service: PinsTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinsTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
