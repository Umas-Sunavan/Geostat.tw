import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { take } from 'rxjs';
import { AnimateService } from 'src/app/modules/map/map-viewer/map-canvas/three-services/animate.service';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.sass']
})
export class CompletedComponent implements OnInit {

  constructor(
    private animateService: AnimateService
  ) { }
  blurSource: string = ''
  themeColor = 'primary'
  popupBgClass = 'bg-white/10'
  enableCta = true
  @Input() set useBlurPadding(enable: boolean) { this.loadBlurSource(enable) }
  @Output() setHide = new EventEmitter<boolean>()
  @Output() onSubmit = new EventEmitter<boolean>()
  @Input() name: string = ''
  @Input() set setThemeColor(theme: string) { this.themeColor = theme}
  @Input() set setPopupBg(className: string) { this.popupBgClass = className}
  @Input() set setCta(enable: boolean) { this.enableCta = enable}

  ngOnInit(): void {
  }

  submit = () => {
    this.hide()
    this.onSubmit.next(true)
  }

  hide = () => {
    this.setHide.next(true)
  }

  loadBlurSource = (enable: boolean) => {
    if (enable) {
      this.animateService.getCavasImage().pipe(take(1)).subscribe(value => {
        this.blurSource = `url(${value})`
      })
    } else {
      this.blurSource = '#ffffff'
    }
  }

}
