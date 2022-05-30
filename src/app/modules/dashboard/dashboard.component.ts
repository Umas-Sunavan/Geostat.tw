import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, map } from 'rxjs';
import { CategorySetting, CategorySettings, CategorySettingWithId } from 'src/app/shared/models/CategorySettings';
import { HttpMap } from 'src/app/shared/models/MapHttp';
import { CategoryService } from '../map/map-viewer/map-canvas/category/category.service';
import { MapHttpService } from './map-http/map-http.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  constructor(
    private mapHttpService: MapHttpService,
    private router: Router,
    private categoryService: CategoryService,
  ) { }

  maps: HttpMap[] = []
  categories: CategorySettingWithId[] = []
  editingMapId?: number 
  editingCategoryId?: string 

  showAddNamePopup: boolean = false
  showReamePopup: boolean = false
  mapIdRenaming?: number
  showAddCompletePopup: boolean = false
  addedMapName: string = ""
  addedMapId: string = ""

  async ngOnInit(): Promise<void> {
    this.maps = await lastValueFrom(this.updateMaps())
    this.categoryService.getCategorySettings().pipe( map( this.categorySettingsAppendKeyName ) ).subscribe( categories => {
      this.categories = categories
    })
  }

  updateMaps = () => this.mapHttpService.getMaps()

  onMapClick = (id: number) => {
    this.router.navigate(['map',id])
  }

  editMap = (event: MouseEvent, id: number) => {
    event.stopPropagation();
    this.editingMapId = id
  }

  deleteMap = async (event: MouseEvent, id: number) => {
    event.stopPropagation();
    await lastValueFrom(this.mapHttpService.deleteMap(id))
    this.maps = await lastValueFrom(this.updateMaps())
  }

  renameMap = (event: MouseEvent, id: number) => {
    this.mapIdRenaming = id
    event.stopPropagation();
    console.log(event);
    this.toggleMapRenamePopup()
  }

  @Input() onGotName = (name :string) => {
    this.categoryService.addCategoryOptions(this.categoryService.mockOptions).then( optionId => {
      console.log(optionId);
      if (!optionId) throw new Error("failed to create category options");
      this.mapHttpService.addMap(name,"admin", "-N-SasgrgpgWs2szH-aH",optionId).subscribe( result => {
        console.log(result);
        this.addedMapName = result.name
        this.addedMapId = result.id
        this.toggleAddCompletePopup()
      })
    })
    this.toggleAddMapNamePopup()
  }

  @Input() onRenamed = async (name: string) => {
    if(!this.mapIdRenaming) throw new Error("no rename id found");
    await lastValueFrom(this.mapHttpService.renameMap(this.mapIdRenaming, name))
    this.maps = await lastValueFrom(this.updateMaps())
    this.toggleMapRenamePopup()
  }

  toggleAddMapNamePopup = () => this.showAddNamePopup = !this.showAddNamePopup
  toggleMapRenamePopup = () => this.showReamePopup = !this.showReamePopup
  toggleAddCompletePopup = () => this.showAddCompletePopup = !this.showAddCompletePopup

  switchNewMap = () => {
    if (this.addedMapId && +this.addedMapId) {
      this.onMapClick(+this.addedMapId)
    } else {
      throw new Error("the map id that was added is not an number");
      
    }
  }

  onAddMapClick = (event: MouseEvent) => {
    console.log(event);
    this.toggleAddMapNamePopup()
  }

  clickSpace = (event: MouseEvent) => {
    event.stopPropagation();
    this.editingMapId = undefined
    this.editingCategoryId = undefined
  }

  // CATEGORY

  isAddCategoryShow: boolean = false
  isAddNameShow: boolean = false
  isCompletedShow: boolean = false
  
  categoryNameToAdd: string = ""
  categoryUrlToAdd: string = ""
  
  @Input() toggleAddCategoryShow = () => this.isAddCategoryShow = !this.isAddCategoryShow
  toggleAddNameShow = () => this.isAddNameShow = !this.isAddNameShow
  @Input() toggleCompletedShow = () => this.isCompletedShow = !this.isCompletedShow

  @Input() onGotSheetUrl = (url : string) => {
    this.categoryUrlToAdd = url
    this.toggleAddNameShow()
  }

  @Input() nameMoveLastSetp = () => {
    this.toggleAddCategoryShow()
    this.toggleAddNameShow()
  }

  @Input() onGotCategoryName = (name: string) => {
    this.categoryNameToAdd = name
    this.toggleCompletedShow()
    this.toggleAddNameShow()
    const defaultSetting = this.categoryService.mockSetting
    defaultSetting.tableName = name
    if(!this.categoryUrlToAdd) throw new Error("no google sheet url before creating new category on database");
    defaultSetting.tableSource = this.categoryService.getSheetIdFromUrl(this.categoryUrlToAdd)
    this.categoryService.addCategory(defaultSetting)
  }

  deleteCategory = async (event: MouseEvent, id: string) => {
    event.stopPropagation();
    console.log(id);
    this.categoryService.deleteCategorySetting(id)
    this.maps = await lastValueFrom(this.updateMaps())
  }

  editCategoryTable = async (event: MouseEvent, id: string) => {
    const category = this.categories.find( category => category.categoryId === id)
    if (!category) throw new Error("no url link provided in the firebase category data");
    window.open(`https://docs.google.com/spreadsheets/d/${category.tableSource}/edit`, '_blank');
  }

  categorySettingsAppendKeyName = (categoriesObj: CategorySettings) => {
    const categoriesMappedId = []
      for (const categoryName in categoriesObj) {
      const category = categoriesObj[categoryName]
      const CategoryMappedId: CategorySettingWithId = { categoryId: categoryName, ...category }
      categoriesMappedId.push(CategoryMappedId)
    }
    return categoriesMappedId
  }

  editCategory = (event: MouseEvent, id: string) => {
    event.stopPropagation();
    console.log(event);
    this.editingCategoryId = id
  }


}
