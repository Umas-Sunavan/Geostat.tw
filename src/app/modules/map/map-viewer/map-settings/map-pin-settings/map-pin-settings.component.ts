import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pin, PinWithPolygonType } from 'src/app/shared/models/Pin';
import { Polygon, PolygonType } from 'src/app/shared/models/Polygon';

@Component({
  selector: 'app-map-pin-settings',
  templateUrl: './map-pin-settings.component.html',
  styleUrls: ['./map-pin-settings.component.sass']
})
export class MapPinSettingsComponent implements OnInit {

  constructor() { }
  pins: Pin[] = []
  unselectedPins: Pin[] = []
  selectedPins: Pin[] = []
  selectedPinsWithType: PinWithPolygonType[] = []
  @Input() polygons: Polygon[] = []
  @Input() set setPolygons(polygons: Polygon[]) {
    this.onPolygonUpdated(polygons)
  }
  @Input() blurSource: string = ''
  @Input() set setSelectedPins(pins: Pin[]) {
    this.selectedPins = pins
    this.updateUnselected()
  }
  @Input() set setPins(pins: Pin[]) {
    this.pins = pins
    this.updateUnselected()
  }
  @Output() pinChecked: EventEmitter<Pin[]> = new EventEmitter()

  ngOnInit(): void {

  }

  updateUnselected = () => {
    const unselectedPins = this.pins.filter(pin => {
      const hasPin = this.selectedPins?.some(selectedPin => selectedPin.id === pin.id)
      return !hasPin
    })
    this.unselectedPins = unselectedPins
  }

  uncheckPin = (uncheckPin: Pin) => {
    this.selectedPins = this.selectedPins.filter(pin => pin.id !== uncheckPin.id)
    this.updateUnselected()
    this.pinChecked.emit(this.selectedPins)
  }

  checkPin = (pin: Pin) => {
    this.selectedPins?.push(pin)
    this.updateUnselected()
    this.pinChecked.emit(this.selectedPins)
  }

  onPolygonUpdated = (polygons: Polygon[]) => {
    this.polygons = polygons
    this.selectedPinsWithType = this.mapPinsWithPolygonType(this.selectedPins, this.polygons)
  }

  mapPinsWithPolygonType = (selectedPins: Pin[], polygons: Polygon[]) => {
    return selectedPins.map((pin): PinWithPolygonType => {
      let found = this.findPolygonType(polygons, pin)
      if (!found.polygonType) {
        found.polygonType = []
      }
      return found
    })
  }

  findPolygonType = (polygons: Polygon[], pin: Pin): PinWithPolygonType => {
    let pinWithtype: PinWithPolygonType = JSON.parse(JSON.stringify(pin))
    polygons.forEach(polygon => {
      const foundPin = polygon.points.find(point => pin.id === point.id)
      if (foundPin) {
        if (pinWithtype.polygonType) {
          pinWithtype.polygonType.push(polygon.type)
        } else {
          pinWithtype.polygonType = [polygon.type]
        }
      }
    })
    return pinWithtype
  }

  // template function

  isPinTypeTriangle = (pin: PinWithPolygonType) => pin.polygonType.some(type => type === PolygonType.triangle)

  isPinTypeRectangle = (pin: PinWithPolygonType) => pin.polygonType.some(type => type === PolygonType.rectangle)
}
