import { TestBed } from '@angular/core/testing';

import { Column3dService } from './column-3d.service';

describe('Column3dService', () => {
  let service: Column3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Column3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
