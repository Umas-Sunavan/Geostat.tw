import { Injectable } from '@angular/core';
import { Pin, PinWithDnc } from 'src/app/shared/models/Pin';
import { Camera, CylinderGeometry, Group, Intersection, Mesh, MeshPhongMaterial, Object3D, Vector2, Vector3 } from 'three';

@Injectable({
  providedIn: 'root'
})
export class PinUtilsService {

  constructor() { }


  // utils: 

  // comparation

  isSamePins = (pinsA: Pin[], pinsB: Pin[]) => {
    const aIds = pinsA.map( pin => +pin.id).sort((a,b) => a-b);
    const bIds = pinsB.map( pin => +pin.id).sort((a,b) => a-b);
    const isEqual = JSON.stringify(aIds) === JSON.stringify(bIds)
    return isEqual
  }

  isObjectAGroup = ( object: Object3D) => {
    const isGroup = object.children.find( mesh => mesh.parent?.name.includes('group')) as Group
    return isGroup
  }

  aFilterFromB = (aPins: Pin[], bPins: Pin[]) => {
    const diference = aPins.filter( aPin => {
      const isDuplicate = bPins.some( bPin => aPin.id === bPin.id)
      return !isDuplicate
    })
    return diference
  }

  // find

  findPinById = (pins: Pin[], ids: string[]) =>  {
    return ids.map( id => {
      const found  =pins.find( pin => pin.id+'' === id)
      if (!found) throw new Error("the raycasted group object is not found in this.pins");
      return found
    })
  }

  getMeshesById = (pins: Pin[], pinId: number) => {
    const pin = pins.find( pin => pin.id === pinId)
    const group = pin?.mesh
    if (group) {
      const column = this.getPinMeshInGroup(group, 'column')
      const ground = this.getPinMeshInGroup(group, 'ground')
      return {column, ground}
    } else {
      throw new Error("No group found ");
    }
  }

  // tranform

  mappingToGroups = (pins:Pin[]) => {
    return pins.filter( pin => pin.mesh).map( pin => pin.mesh!)
  }

  filterGroupFromObjs = (objects: Object3D[]) => {
    return objects.filter( obj => this.isObjectAGroup(obj)) as Group[]
  }

  filterDuplicateGroup = (groups: Group[]) => {
    const unique: Group[] = []
    groups.forEach(group => {
      if(!group) return
      const isDuplicate = unique.some( uniquePin => uniquePin.name === group?.name)
      if (!isDuplicate) unique.push(group as Group)
    });
    return unique
  }

  getPinIdsFromIntersections = (intersections: Intersection[]) => {
    const objs = intersections.map( intersection => intersection.object)
    const parents = objs.map( obj => obj.parent!).filter( parent => Boolean(parent))
    const groups = this.filterGroupFromObjs(parents)
    const unique = this.filterDuplicateGroup(groups)
    const ids = unique.map( group => this.getPinIdFromGroup(group))
    return ids
  }

  getPinIdFromGroup = (group:Group) => {
    const id = group.name.match(/(?=.+_?)\d+/);
    const isValidId = id && id[0]
    if(isValidId) {
      return id[0]
    } else {
      throw new Error("hovered pin has no valid id");
    }
  }

  // mesh

  getPinMeshInGroup = (group: Group, selector: string) => group.children.find( child => child.name.includes(selector)) as Mesh<CylinderGeometry, MeshPhongMaterial>

  // projection

  getPinsDnc = (pins: Pin[], canvasDimension: Vector2, camera: Camera) => {
    const sahderCoordXToDncX = (shaderCoordX: number, canvasW: number) => (shaderCoordX + 1) / 2 * canvasW 
    const sahderCoordXToDncY = (shaderCoordY: number, canvasH: number) => (-shaderCoordY + 1) / 2 * canvasH
    const pinsWithDnc: PinWithDnc[] = pins.map( pin => {
      if(!pin.position3d) throw new Error("no position in selected pin");
      const shaderCoordinate = pin.position3d.clone().project(camera)
      // TERMINOLOGY: DNC is the pixel coordinate on the canvas DOM
      const dncX = sahderCoordXToDncX(shaderCoordinate.x, canvasDimension.x)
      const dncY = sahderCoordXToDncY(shaderCoordinate.y, canvasDimension.y)
      const pinWithDnc:PinWithDnc = { ... pin, deviceCoordinate: new Vector2(dncX, dncY) }
      return pinWithDnc
    })
    return pinsWithDnc
  }

  testProject = (camera: Camera, positionToPrject: Vector3) => {
    const canvasW = 600, canvasH = 450
    const canvasWHalf = canvasW / 2, canvasHHalf = canvasH / 2;
    const shaderCoordinate = positionToPrject.clone().project(camera); // returns a shader-like coordinate position
    const x = ( shaderCoordinate.x * canvasWHalf ) + canvasWHalf;
    const y = - ( shaderCoordinate.y * canvasHHalf ) + canvasHHalf;
    const dncCoordinate = new Vector2(x,y)
    return dncCoordinate
  }

  testUnproject = (camera: Camera, dnc: Vector3) => {
    const shaderPosition = dnc
    shaderPosition.unproject(camera); // -1~1 => -screen width/2~screen width/2
    const normalUnprojection = new Vector3().subVectors(shaderPosition, camera.position).normalize(); // normalize to (0~1,0~1,0~1) position and move the the world center
    const distance = ( 0 - camera.position.z ) / normalUnprojection.z;
    normalUnprojection.multiplyScalar(distance) // move the box position towards the direction at which camera.position looks
    const pos = new Vector3().copy(camera.position).add(normalUnprojection); // currently the position is moved from the world center. the actuall position should be moved from the camera
    return pos
  }


}
