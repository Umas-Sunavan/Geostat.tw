import { Component, OnInit } from '@angular/core';
import { Pin, PinWithDnc } from 'src/app/shared/models/Pin';
import { Polygon } from 'src/app/shared/models/Polygon';
import { Color, Vector2, Vector3 } from 'three';

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.sass']
})
export class MapViewerComponent implements OnInit {

  constructor() { }

  hoverPin?: { pin: Pin, legendPosition: Vector2 }
  selectedPin: { pin: Pin, legendPosition: Vector2 }[] = []
  pinsSelectedWithDnc: PinWithDnc[] = []
  averageMoving: Vector2[] = []
  pins: Pin[] = []
  pinSelected?: Pin[]

  changeHoverLegend = (options?: { pin: Pin, legendPosition: Vector2 }) => {
    this.hoverPin = options
  }

  ngOnInit(): void {
  }

  onPinSelected = (pins: Pin[]) => {
    const newList = [...pins]
    this.pinSelected = newList
  }

  onSelectedPinsWithDnc = (pinsWithDnc: any) => {
    this.pinsSelectedWithDnc.forEach( (pin,i) => {
      const isExist = Boolean(pinsWithDnc[i])
      if (isExist) {
        const nextPosition = pinsWithDnc[i].deviceCoordinate.clone()
        const thisPosition = pin.deviceCoordinate
        const lerp = nextPosition.sub(thisPosition).multiplyScalar(0.3)
        pinsWithDnc[i].deviceCoordinate = pin.deviceCoordinate.clone().add(lerp)
      }
    })
    this.pinsSelectedWithDnc = pinsWithDnc
  }

  polygonUpdate = (polygons: Polygon[]) => {
    console.log(polygons);
  }
}
