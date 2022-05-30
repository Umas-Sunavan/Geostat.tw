import { TestBed } from '@angular/core/testing';

import { PinCategoryMappingService } from './pin-category-mapping.service';

describe('PinCategoryMappingService', () => {
  let service: PinCategoryMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinCategoryMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
