import { GoogleSheetPin } from "./GoogleSheetPin";
import { GeoencodingRaw } from "./Geoencoding";

export interface GoogleSheetPinMappingGeoencodingRaw {
    pointData: GoogleSheetPin;
    geoencodingRaw: GeoencodingRaw;
}