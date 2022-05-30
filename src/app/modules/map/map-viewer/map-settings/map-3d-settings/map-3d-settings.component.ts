import { AfterContentChecked, AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { take, window } from 'rxjs';
import { Gui3dSettings } from 'src/app/shared/models/GuiColumnSettings';
import { GuiPolygonSettings } from 'src/app/shared/models/GuiPolygonSettings';
import { Polygon } from 'src/app/shared/models/Polygon';
import { MapCanvasComponent } from '../../map-canvas/map-canvas.component';
import { AnimateService } from '../../map-canvas/three-services/animate.service';

@Component({
  selector: 'app-map-3d-settings',
  templateUrl: './map-3d-settings.component.html',
  styleUrls: ['./map-3d-settings.component.sass']
})
export class Map3dSettingsComponent implements OnInit {

  constructor() { }
  @Input() columnSettings!: Gui3dSettings
  @Input() polygonSettings!: GuiPolygonSettings
  @Input() blurSource: string = ''
  @Output() columnChanged: EventEmitter<Event> = new EventEmitter()
  @Output() polygonChanged: EventEmitter<Event> = new EventEmitter()
  @ViewChild('resizeContainer') resizeContainer!: ElementRef<HTMLDivElement>
  isScrollBarShow: boolean = false

  ngOnInit(): void {
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onResize()
    }, 0);
  }

  onResize = (event?: Event) => {
    const contentSize = this.resizeContainer.nativeElement.scrollHeight
    const containerSize = this.resizeContainer.nativeElement.clientHeight
    this.isScrollBarShow = contentSize > containerSize
  }


  changeColumn = (event: Event) => this.columnChanged.emit(event)

  changePolygon = (event: Event) => this.polygonChanged.emit(event)

}

