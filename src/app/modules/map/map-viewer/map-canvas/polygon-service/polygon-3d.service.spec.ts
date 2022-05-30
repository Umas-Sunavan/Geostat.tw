import { TestBed } from '@angular/core/testing';

import { Polygon3dService } from './polygon-3d.service';

describe('Polygon3dService', () => {
  let service: Polygon3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Polygon3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
