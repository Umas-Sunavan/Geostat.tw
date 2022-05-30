import { TestBed } from '@angular/core/testing';

import { TileUtilsService } from './tile-utils.service';

describe('TileUtilsService', () => {
  let service: TileUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TileUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
