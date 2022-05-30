import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TileLonglatCalculationService {

  constructor() { }

  // sampleLon = 121.5443
  // sampleLat = 25.0509
  // zoom = 16
  // // tile is x: 54894, y: 28054, zoom: 16
  // initSampleLon = 121.5443
  // initSampleLat = 25.0509
  // initSampleZoom = 16

  // setSampleLocation = (lon: number, lat: number, zoom: number) => {
  //   this.sampleLon = lon
  //   this.sampleLat = lat
  //   this.zoom = zoom
  // }

  // getSampleLocation = () => {return { lon: this.sampleLon, lat: this.sampleLat, zoom: this.zoom }}

  // sampleLonLat2tile = () => {
  //   const x = this.lon2tile(this.sampleLon, this.zoom)
  //   const y = this.lat2tile(this.sampleLat, this.zoom)
  //   console.log({ x, y, zoom: this.zoom });
    
  //   return { x, y, zoom: this.zoom }
  // }

  // initLonLat2tile = () => {
  //   const x = this.lon2tile(this.initSampleLon, this.zoom)
  //   const y = this.lat2tile(this.initSampleLat, this.zoom)
  //   return { x, y, zoom: this.zoom }
  // }

  // getLeft = (sampleLon: number, zoom: number) => {
  //   const tilePosition = this.lon2tile(sampleLon, zoom)
  //   const lonLeft = this.tile2lon(tilePosition, zoom)
  //   return lonLeft
  // }

  // getRight = (sampleLon: number, zoom: number) => {
  //   const tilePosition = this.lon2tile(sampleLon, zoom)
  //   const lonRight = this.tile2lon(tilePosition + 1, zoom)
  //   return lonRight
  // }

  // getLonCenter = () => {
  //   const lonLeft = this.getLeft(this.sampleLon, this.zoom)
  //   const lonRight = this.getRight(this.sampleLon, this.zoom)
  //   const lonCenter = (lonLeft + lonRight) / 2
  //   return lonCenter
  // }

  // getTop = (sampleLat: number, zoom: number) => {
  //   const tilePosition = this.lat2tile(sampleLat, zoom)
  //   const tileTop = this.tile2lat(tilePosition, zoom)
  //   return tileTop
  // }

  // getBottom = (sampleLat: number, zoom: number) => {

  //   const tilePosition = this.lat2tile(sampleLat, zoom)
  //   const tileBottom = this.tile2lat(tilePosition + 1, zoom)
  //   return tileBottom
  // }

  // getLatCenter = () => {
  //   const tileTop = this.getTop(this.sampleLat, this.zoom)
  //   const tileBottom = this.getBottom(this.sampleLat, this.zoom)
  //   const latCenter = (tileTop + tileBottom) / 2
  //   return latCenter
  // }

  // getWidth = () => {
  //   const w = this.getRight(this.sampleLon, this.zoom) - this.getLeft(this.sampleLon, this.zoom)
  //   return w
  // }

  // getHeight = () => {
  //   const h = this.getTop(this.sampleLat, this.zoom) - this.getBottom(this.sampleLat, this.zoom)
  //   return h
  // }

  intLonLat2Tile = (longitude: number, latitude: number, zoom: number) => {
    const x = this.intLon2tile(longitude, zoom)
    const y = this.intLat2tile(latitude, zoom)
    return { x, y, zoom }
  }

  intLon2tile = (longitude: number, zoom: number) => {
    return Math.floor((longitude + 180) / 360 * Math.pow(2, zoom));
  }

  intLat2tile = (latitude: number, zoom: number) => {
    const pi = Math.PI

    return Math.floor((1 - Math.log(Math.tan(latitude * pi / 180) + 1 / Math.cos(latitude * pi / 180)) / pi) / 2 * Math.pow(2, zoom));
  }

  lonLat2Tile = (longitude: number, latitude: number, zoom: number) => {
    const x = this.lon2tile(longitude, zoom)
    const y = this.lat2tile(latitude, zoom)
    return { x, y, zoom }
  }

  lon2tile = (longitude: number, zoom: number) => {
    return (longitude + 180) / 360 * Math.pow(2, zoom);
  }

  lat2tile = (latitude: number, zoom: number) => {
    const pi = Math.PI

    return (1 - Math.log(Math.tan(latitude * pi / 180) + 1 / Math.cos(latitude * pi / 180)) / pi) / 2 * Math.pow(2, zoom);
  }

  tile2lon = (x: number, zoom: number) => {
    return (x / Math.pow(2, zoom) * 360 - 180);
  }

  tile2lat = (y: number, zoom: number) => {
    var pi = Math.PI
    var n = pi - 2 * pi * y / Math.pow(2, zoom);
    return 180 / pi * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }
}
