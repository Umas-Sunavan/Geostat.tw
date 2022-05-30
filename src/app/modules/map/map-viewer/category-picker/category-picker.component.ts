import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BehaviorSubject, lastValueFrom, map, mergeMap, of, Subject, take } from 'rxjs';
import { MapHttpService } from 'src/app/modules/dashboard/map-http/map-http.service';
import { CategorySetting, CategorySettings, CategorySettingWithId } from 'src/app/shared/models/CategorySettings';
import { HttpMap } from 'src/app/shared/models/MapHttp';
import { CategoryService } from '../map-canvas/category/category.service';
import { AnimateService } from '../map-canvas/three-services/animate.service';

@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.sass']
})
export class CategoryPickerComponent implements OnInit {

  constructor(
    private animateService: AnimateService,
    private categoryService: CategoryService,
    private mapHttpService: MapHttpService,
    private activatedRoute: ActivatedRoute,
  ) { }

  blurSource: string = ''
  categoriesMappedId: CategorySettingWithId[] = []
  radioValue: string = ''
  isAddCategoryShow: boolean = false
  isAddNameShow:boolean = false
  addedName = ''
  isCompletedShow: boolean = false
  addingSheetUrl?: string
  addingCategoryId?: string
  categoryChangeSubject: Subject<string> = new Subject()
  @Output() changeCategoryOnCanvas: EventEmitter<string> = new EventEmitter()


  onCategoryChange = () => {
    this.categoryChangeSubject.pipe(
      mergeMap( categoryId => {
        const mapId = this.activatedRoute.snapshot.paramMap.get("id") || ''
        return of({mapId, categoryId})
      }), 
      mergeMap(({mapId, categoryId}) => {
        console.log(categoryId);
        
        return this.mapHttpService.changeDefaultCategory(mapId, categoryId)
      })
    ).subscribe( result => {
      console.log(result);
    })
  }

  async ngOnInit(): Promise<void> {
    this.categoryService.getCategorySettings().subscribe(categoriesObj => {
      const categoriesMappedId: CategorySettingWithId[] = []
      for (const categoryName in categoriesObj) {
        const category = categoriesObj[categoryName]
        const CategoryMappedId: CategorySettingWithId = { categoryId: categoryName, ...category }
        categoriesMappedId.push(CategoryMappedId)
      }
      console.log(categoriesMappedId);
      this.categoriesMappedId = categoriesMappedId
      categoriesMappedId[0].tableName
    })
    this.onCategoryChange()
    const mapId = this.activatedRoute.snapshot.paramMap.get("id")
    if(mapId !== null && +mapId !== NaN) {
      const map: HttpMap = await lastValueFrom(this.mapHttpService.getMap(+mapId))
      this.changeCategory(map.defualtCategoryId)
      this.radioValue = map.defualtCategoryId
    }
  }

  isShow: boolean = true

  toggleShow = () => {
    this.isShow = !this.isShow
    if (this.isShow) {
      this.animateService.getCavasImage().pipe(take(1)).subscribe(value => {
        this.blurSource = `url(${value})`
      })
    }
  }
  changeCategory = (categoryId: string) => {
    this.categoryChangeSubject.next(categoryId)
    this.changeCategoryOnCanvas.emit(categoryId)
  }

  toggleAddCategory = () => this.isAddCategoryShow = !this.isAddCategoryShow

  nameMoveLastSetp = () => {
    this.toggleAddName()
    this.toggleAddCategory()
  }

  onGotSheetUrl = (url: string) => {
    console.log(url); 
    this.addingSheetUrl = url
    this.toggleAddName()
  }

  toggleAddName = () => this.isAddNameShow = !this.isAddNameShow

  toggleCompletedShow = () => this.isCompletedShow = !this.isCompletedShow

  switchNewCategory = (boolean: boolean) => {
    console.log(this.isCompletedShow);
    if (!this.addingCategoryId) throw new Error("no addingCategoryId. the category could failed without internet connection");
    this.changeCategory(this.addingCategoryId)
    this.radioValue = this.addingCategoryId
  }

  onGotName = (name: string) => {
    this.toggleAddName()
    this.toggleCompletedShow()
    const defaultSetting = this.categoryService.mockSetting
    defaultSetting.tableName = name
    this.addedName = name
    if(!this.addingSheetUrl) throw new Error("no google sheet url before creating new category on database");
    defaultSetting.tableSource = this.categoryService.getSheetIdFromUrl(this.addingSheetUrl)
    this.addingCategoryId = this.categoryService.addCategory(defaultSetting) || ''
  }

  updateSelectedStyle = (id: string) => id === this.radioValue ? `url('./assets/icons/checked-radio.svg')` : 'initial'

}
