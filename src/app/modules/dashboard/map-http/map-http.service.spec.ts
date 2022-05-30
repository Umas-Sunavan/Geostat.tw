import { TestBed } from '@angular/core/testing';

import { MapHttpService } from './map-http.service';

describe('MapHttpService', () => {
  let service: MapHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
