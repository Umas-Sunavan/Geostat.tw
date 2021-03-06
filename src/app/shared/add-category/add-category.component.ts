import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { catchError, debounceTime, delay, Observable, of, Subject, switchMap, take, timeout } from 'rxjs';
import { CategoryService } from 'src/app/modules/map/map-viewer/map-canvas/category/category.service';
import { AnimateService } from 'src/app/modules/map/map-viewer/map-canvas/three-services/animate.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.sass']
})
export class AddCategoryComponent implements OnInit {

  constructor(
    private animateService:AnimateService,
    private categoryService:CategoryService,
  ) { }

  ngOnInit(): void {
    this.checkUrlAccessable()
  }

  showSubmitTip: boolean = false
  googleSheetErrorDscription: string = ''
  googleSheetSuccessDscription: string = ''
  showTip: boolean = false
  blurSource: string = ''
  sheetUrl: string = ''
  popupBgClass = 'bg-white/10'
  onKeyChange: Subject<any> = new Subject()
  @Output() onSubmit: EventEmitter<string> = new EventEmitter()
  @Output() setHide: EventEmitter<undefined> = new EventEmitter()
  @Input() set useBlurPadding( enable: boolean) {this.loadBlurSource(enable)}
  @Input() set setPopupBg(className: string) { this.popupBgClass = className}

  toggleShowTip = () => this.showTip = !this.showTip

  hide = () => this.setHide.emit()

  urlKeyUp = (event: Event, url: string, hasErrorBrforeKeyUp: any) => {
    if(!hasErrorBrforeKeyUp) {
      this.onKeyChange.next(url)
    }
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

  checkUrlAccessable = () => {
    this.onKeyChange.pipe( debounceTime(500), switchMap( url => of(url))).subscribe( url => {
      this.categoryService.getCategoryTableByUrl(url).subscribe( statusCode => {
        console.log(statusCode);
        
        switch (statusCode) {
          case 401:
            this.googleSheetErrorDscription = '????????????????????????????????????????????????'
            this.googleSheetSuccessDscription = ''
            break;
          case 404:
            this.googleSheetErrorDscription = '??????????????????????????????????????????????????????????????????'
            this.googleSheetSuccessDscription = ''
            break;
          case 0:
            this.googleSheetErrorDscription = '?????????????????????????????????????????????????????????????????????'
            this.googleSheetSuccessDscription = ''
            break;
          case 200:
            this.googleSheetErrorDscription = ''
            this.googleSheetSuccessDscription = '??????????????????????????????'
            break;
          default:
            break;
        } 
      })
    })
  }

  getSheetId = () => {
    return this.categoryService.getSheetIdFromUrl(this.sheetUrl)
  }

  submit = (hasErrors: any) => {
    if (hasErrors) return
    this.showSubmitTip = true
    this.onSubmit.next(this.sheetUrl)
    this.hide()
  }
}
