import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPinSettingsComponent } from './map-pin-settings.component';

describe('MapPinSettingsComponent', () => {
  let component: MapPinSettingsComponent;
  let fixture: ComponentFixture<MapPinSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapPinSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapPinSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
