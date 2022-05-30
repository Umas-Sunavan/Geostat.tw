import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { take } from 'rxjs';
import { Gui3dSettings } from 'src/app/shared/models/GuiColumnSettings';
import { GuiPolygonSettings } from 'src/app/shared/models/GuiPolygonSettings';
import { Pin } from 'src/app/shared/models/Pin';
import { Polygon } from 'src/app/shared/models/Polygon';
import { AnimateService } from '../map-canvas/three-services/animate.service';

@Component({
  selector: 'app-map-settings',
  templateUrl: './map-settings.component.html',
  styleUrls: ['./map-settings.component.sass']
})
export class MapSettingsComponent implements OnInit {

  constructor(
    private animateService: AnimateService,
  ) { }

  // @Input('canvas') set canvas() => {}
  @Input() columnSettings!: Gui3dSettings
  @Output() columnChanged: EventEmitter<Event> = new EventEmitter()
  @Output() polygonChanged: EventEmitter<Event> = new EventEmitter()
  @Input() polygonSettings!: GuiPolygonSettings
  @Input() polygons: Polygon[] = []
  @Input() pins: Pin[] = []
  @Input() hoveringPins: Pin[] = []
  @Input() selectedPins: Pin[] = []
  @Output() pinSelected: EventEmitter<Pin[]> = new EventEmitter()
  
  testValue = 0.5
  blurSource:string = ''
  showSettings: boolean = false

  ngOnInit(): void {
  }

  toggleShow = () => {
    this.showSettings = !this.showSettings
    if(this.showSettings) {
      this.animateService.getCavasImage().pipe(take(1)).subscribe( value => {
        this.blurSource = `url(${value})`
      })
    }
  }

  onPinSelected = (pins: Pin[]) => {
    this.pinSelected.emit(pins)
  }

  onColumnChanged = (event: Event) => {
    this.columnChanged.emit(event)
  }

  onPolygonChanged = (event: Event) => {
    this.polygonChanged.emit(event)
  }

}
