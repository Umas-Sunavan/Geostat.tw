import { Color, Mesh, Vector3 } from "three";
import { Pin } from "./Pin";

export enum PolygonType {
  triangle = 'triangle',
  rectangle = 'rectangle',
}

export interface Polygon {
  id:string,
  points: Pin[]
  color: number
  opacity: number
  mesh?: Mesh
  type: PolygonType
}