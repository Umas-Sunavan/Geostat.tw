import { Injectable } from '@angular/core';
import { GuiPolygonSettings } from 'src/app/shared/models/GuiPolygonSettings';
import { Pin } from 'src/app/shared/models/Pin';
import { Polygon, PolygonType } from 'src/app/shared/models/Polygon';
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshPhongMaterial, Scene, Shape, ShapeGeometry, Vector2 } from 'three';
import { Column3dService } from '../column-3d-services/column-3d.service';

@Injectable({
  providedIn: 'root'
})
export class Polygon3dService {

  constructor(
    private column3dService: Column3dService,
    ) { }

  createPolygons = (selectedPins: Pin[], settings: GuiPolygonSettings) => {
    const pinCount: number = selectedPins.length
    const useRectangleMode = pinCount%3 === 1 && pinCount/3 > 1
    const everyThreePins = pinCount - pinCount%3
    const pinsToMakeTriangles = selectedPins.slice(0,everyThreePins)
    const { models, meshes } = this.createTriangles(pinsToMakeTriangles, settings)
    if (useRectangleMode) {
      const lastFourPoints = selectedPins.slice(-4)
      const { model, mesh } = this.createRectangle(lastFourPoints, settings)
      models.push(model)
      meshes.push(mesh)
    }
    return { models, meshes }
  }

  removePolygons = (polygons: Polygon[]) => {
    polygons.forEach( polygon => {
      if (!polygon.mesh) throw new Error("no mesh to remove");
      polygon.mesh.removeFromParent()
    })
    polygons = []
    return polygons
  }

  createRectangle = (points: Pin[], settings: GuiPolygonSettings) => {
    const model = this.createPolygonModel(points, PolygonType.rectangle, settings)
    const mesh = this.createRectangleMesh(model)
    model.mesh = mesh
    return { model, mesh }
  }

  createTriangles = (points: Pin[], settings: GuiPolygonSettings) => {
    const models = []
    const meshes = []
    for (let i = 0; i < points.length; i+=3) {
      const polygonPoints = points.slice(i,i+3)
      const model = this.createPolygonModel(polygonPoints, PolygonType.triangle, settings)
      model.mesh = this.createPolygonMesh(model)
      meshes.push(model.mesh)
      models.push(model)
    }
    return { meshes, models }
  }

  createPolygonModel = (pointPins:Pin[], idPrefix: PolygonType, settings: GuiPolygonSettings):Polygon => {
    const polygonId = pointPins.map(pin => pin.id).join('_')
    return {
      id: `polygon_${idPrefix}_${polygonId}`,
      points: pointPins,
      color: this.column3dService.parseStringColorToInt(settings.color),
      opacity: settings.opacity,
      type: idPrefix
    }
  }  
  
  createRectangleMesh = (model: Polygon) => {    
    const pointPositions = model.points.map( pin => {
      if (!pin.position3d) throw new Error("a pin has no position when creating triangle polygon");
      return pin.position3d
    })
    const totallVector = pointPositions.reduce( (prev, curr) => prev.clone().add(curr))
    const center = totallVector.multiplyScalar(0.25)
    const positionWithSlope = pointPositions.map( (points,i) => {
      const pToCenter3d = points.clone().sub(center)
      const p0ToCenter2d = new Vector2(pToCenter3d.x, pToCenter3d.z)
      const slope = Math.atan2(p0ToCenter2d.y, p0ToCenter2d.x)
      return {
        position3d: points,
        slope: slope/Math.PI
      }
    })
    const clockwisePoints3D = positionWithSlope.sort( (a,b) => a.slope - b.slope)
    const clockwisePoints2D = clockwisePoints3D.map( ({position3d, slope}): [number, number] => {
      return [position3d.x, position3d.z]
    })
    console.log(clockwisePoints2D);
    const shape = new Shape();
    shape.moveTo(...clockwisePoints2D[0])
    shape.lineTo(...clockwisePoints2D[1])
    shape.lineTo(...clockwisePoints2D[2])
    shape.lineTo(...clockwisePoints2D[3])
    shape.lineTo(...clockwisePoints2D[0])
    const geometry = new ShapeGeometry( shape );
    geometry.rotateX(Math.PI* 0.5)
    const material = new MeshPhongMaterial( { color: model.color, opacity: model.opacity, transparent: true , side: DoubleSide} );
    const mesh = new Mesh( geometry, material );
    mesh.name = model.id
    mesh.position.setY(0.005+Math.random()*0.001)
    
    return mesh
  }

  createPolygonMesh = (model: Polygon) => {
    const pointPositions = model.points.map( pin => {
      if (!pin.position3d) throw new Error("a pin has no position when creating triangle polygon");
      return pin.position3d
    })
    const bufferArray = pointPositions.map( point => point.toArray()).flat()
    const vertices = new Float32Array( bufferArray );
    const geometry = new BufferGeometry();
    geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
    const material = new MeshPhongMaterial( { color: model.color, opacity: model.opacity, transparent: true , side: DoubleSide} );
    const mesh = new Mesh( geometry, material );
    mesh.name = model.id
    mesh.position.setY(0.005+Math.random()*0.0001)
    return mesh
  }
}
