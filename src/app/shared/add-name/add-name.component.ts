import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { take } from 'rxjs';
import { AnimateService } from 'src/app/modules/map/map-viewer/map-canvas/three-services/animate.service';

@Component({
  selector: 'app-add-name',
  templateUrl: './add-name.component.html',
  styleUrls: ['./add-name.component.sass']
})
export class AddNameComponent implements OnInit {

  constructor(
    private animateService: AnimateService
  ) { }

  blurSource: string = ''
  nameString: string = ''
  title: string = '資料表名稱'
  placeholder: string = "ex. 各分店營業額"
  backButtonType: string = 'arrow'
  themeColor = 'primary'
  popupBgClass = 'bg-white/10'
  @Output()     setHide = new EventEmitter<boolean>()
  @Input() set setTitle(title: string) { this.title = title}
  @Input() set setPlaceholder(text: string) { this.placeholder = text}
  @Input() set setBackButtonType(type: string) { this.backButtonType = type}
  @Input() set useBlurPadding(enable: boolean) { this.loadBlurSource(enable)}
  @Input() set setThemeColor(theme: string) { this.themeColor = theme}
  @Input() set setPopupBg(className: string) { this.popupBgClass = className}
  @Output()     onSubmit = new EventEmitter<string>()

  ngOnInit(): void {
  }

  hide = () => {
    this.setHide.next(true)
    this.blurSource = ''
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

  submit = (errors: ValidationErrors | null) => {
    if (errors) return
    this.onSubmit.next(this.nameString)
  }

}
