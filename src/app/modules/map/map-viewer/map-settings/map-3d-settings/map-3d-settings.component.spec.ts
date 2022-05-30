import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Map3dSettingsComponent } from './map-3d-settings.component';

describe('MapSettingsComponent', () => {
  let component: Map3dSettingsComponent;
  let fixture: ComponentFixture<Map3dSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Map3dSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Map3dSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
