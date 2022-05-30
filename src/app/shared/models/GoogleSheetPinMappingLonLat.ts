import { Vector2 } from "three";
import { GoogleSheetPin } from "./GoogleSheetPin";

export interface GoogleSheetPinMappingLonLat {
  lonLat: Vector2,
  pinData: GoogleSheetPin
}