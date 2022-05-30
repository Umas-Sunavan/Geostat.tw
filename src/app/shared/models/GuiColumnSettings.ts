import { GuiPolygonSettings } from "./GuiPolygonSettings"

export interface Gui3dSettings {
    columns: {
      defaultColumn: GuiDefaultColumnSettings,
      hoveredColumn: GuiHoveredColumnSettings,
      selectedColumn: GuiSelectedColumnSettings
    }
    ground: GuiGroundSettings
    outline: GuiOutlineSettings
    polygon: GuiPolygonSettings
}

export interface GuiColumnSettings {
  color: string,
  opacity: number,
}

export interface GuiDefaultColumnSettings extends GuiColumnSettings {
  heightScale: number,
  scale: number
}

export interface GuiHoveredColumnSettings extends GuiColumnSettings {}

export interface GuiSelectedColumnSettings extends GuiColumnSettings {}

export interface GuiGroundSettings {
  color: string,
  opacity: number,
}
export interface GuiOutlineSettings {
  color: string,
  opacity: number,
}