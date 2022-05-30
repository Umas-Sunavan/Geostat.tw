import { Injectable } from '@angular/core';
import { CategoryTableRow } from 'src/app/shared/models/CategoryTableRow';
import { Pin } from 'src/app/shared/models/Pin';

@Injectable({
  providedIn: 'root'
})
export class PinCategoryMappingService {

  constructor() { }

  mappingPinAndTable = (rows: CategoryTableRow[], pins: Pin[]) => {
    const unmappedPins = this.filterMappedPins(rows, pins, true)
    const unmappedRows = this.filterMappedRows(rows, pins, true)
    const unmappedCount = [...unmappedPins, ...unmappedRows].length
    if(unmappedCount){
      console.error("Unmapped pins or category rows detected");
    } 
    const mappedPins = this.filterMappedPins(rows, pins, false)
    const mappedRows = this.filterMappedRows(rows, pins, false)
    return {mappedPins, mappedRows}
  }

  filterMappedRows = (rows: CategoryTableRow[], pins: Pin[], filterUnmapped: boolean) => {
    const unmappedRow = rows.filter( row => {      
      const rowExistsInPin = pins.some( pin => pin.title === row.title)
      return filterUnmapped ? !rowExistsInPin : rowExistsInPin
    })
    return unmappedRow
  }

  filterMappedPins = (rows: CategoryTableRow[], pins: Pin[], filterUnmapped: boolean) => {
    const unmappedPin = pins.filter( pin => {
      const pinExistsInRow = rows.some( row => pin.title === row.title)
      return filterUnmapped ? !pinExistsInRow : pinExistsInRow
    })
    return unmappedPin
  }

}
