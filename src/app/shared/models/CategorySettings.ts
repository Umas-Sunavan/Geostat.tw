import { Gui3dSettings } from "./GuiColumnSettings"

export interface CategorySettings {
  [key: string]: CategorySetting
}

export interface CategorySetting {
    deleted: Boolean,
    valid: Boolean,
    options: CategoryOptions,
    tableCreateDate: string,
    tableCreator: string,
    tableName: string,
    tableSource: string,
}

export interface CategorySettingWithId extends CategorySetting {
  categoryId: string
}

export interface CategoryOptions {
  cameraPosition: {
    x: number,
    y: number,
    z: number,
  },
  colors: {
    mainColor: string
  },
  meshSettings: Gui3dSettings,
  connectMode: string,
  connectedPoints: number[],
  focusOnPoint: {
    x: number,
    y: number,
    z: number,
  },
  radius: number
}