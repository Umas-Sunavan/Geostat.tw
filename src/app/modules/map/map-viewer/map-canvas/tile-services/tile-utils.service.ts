import { Injectable } from '@angular/core';
import { Camera, DoubleSide, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, Scene, Vector3 } from 'three';
import { Tile } from 'src/app/shared/models/Tile';
import { TileId } from 'src/app/shared/models/TileId';
import { AnimateService } from '../three-services/animate.service';
import { TextureService } from './texture.service';
import { TileService } from './tile.service';

@Injectable({
  providedIn: 'root'
})
export class TileUtilsService {

  constructor(
    private animateService:AnimateService,
    private textureService: TextureService,
  ) { }

  initTileId: TileId = {
    x: 212,
    y: 108,
    z: 8
  }

  // comparison

  isTileEqual = (atile: Tile, bTile: Tile) => {
    const sameX = atile.id.x === bTile.id.x
    const sameY = atile.id.y === bTile.id.y
    const sameZ = atile.id.z === bTile.id.z
    return sameX && sameY && sameZ
  }

  isTileIdEqual = (aId: TileId, bId: TileId) => {
    const sameX = aId.x === bId.x
    const sameY = aId.y === bId.y
    const sameZ = aId.z === bId.z
    return sameX && sameY && sameZ
  }

  tilesFilterDuplicateByIds = (array: TileId[]) => {
    const uniqueArray: TileId[] = []
    array.forEach(tileId => {
        const isDuplicate = uniqueArray.some(id => this.isTileIdEqual(id, tileId))
        if (!isDuplicate) {
          uniqueArray.push(tileId)
        }
    })
    return uniqueArray
  }

  tilesFilterDuplicate = (array: Tile[]) => {
    const uniqueArray: Tile[] = []
    array.forEach(tile => {
        const isDuplicate = uniqueArray.some(uniqueTile => this.isTileIdEqual(tile.id, uniqueTile.id))
        if (!isDuplicate) {
          uniqueArray.push(tile)
        }
    })
    return uniqueArray
  }

  tilesFarToCamera = (tiles: Tile[], camera: Vector3) => {
    return tiles.filter(tile => {
      if (tile.mesh) {
        const distance = new Vector3().subVectors(tile.mesh.position, camera).length()
        const threshold = this.getDistanceThresholdOfTileToCamera(tile)
        return distance > threshold * 20
      }
      throw new Error("there are tiles missing mesh in runtime");

    })
  }

  // accessing

  getTileById = (fromTiles: Tile[], byId: TileId) => fromTiles.find(tile => {
    const found = this.isTileIdEqual(tile.id, byId)
    return found
  })

  getIdFromChildTile = (id: TileId): TileId => {
    const z = id.z - 1
    const x = Math.floor(id.x / 2)
    const y = Math.floor(id.y / 2)
    return { z, x, y }
  }

  // init tile

  initTileMeshById = (tileIds: TileId[]) => {
    const tiles:Tile[] = []
    for (const tileId of tileIds) {
      const tileResolution = tileId.z
      const rate = Math.pow(2, tileResolution - 8) // Magnificate Rate
      const tileWidth = 12 / rate
      const meshName = `planeZ${tileId.z}X${tileId.x}Y${tileId.y}`
      const mesh = this.getPlane(tileWidth, meshName)
      const initTileX = this.initTileId.x * rate
      const initTileY = this.initTileId.y * rate
      const offset = 0.5
      mesh.position.setX(((tileId.x - initTileX + offset)) * tileWidth)
      mesh.position.setZ(((tileId.y - initTileY + offset)) * tileWidth)
      // mesh.position.setY(tileId.z * 0.3)
      mesh.rotateX(-Math.PI * 0.5)
      const tile:Tile = { id: tileId, mesh: mesh}
      tiles.push(tile)
    }
    return tiles
  }

  // add tile
  // THIS CODE COST TOO MUCH ENERGY
  addTilesById = async (tileIds: TileId[], tiles: Tile[], scene: Scene) => {
    // including adding to the scene and model(binding data)
    const newTiles = await this.getTileMeshById(tileIds)
    tiles.push(...newTiles)
    this.updateTileToRaycaster(tiles)
    this.addTilesToScene(newTiles, scene)
    return tiles
  }

  addChildTile = async (parentTileIds: TileId[], model: Tile[], scene:Scene) => {
    const newTileIds = this.calculateChildTileIdsFromIds(parentTileIds)
    model = await this.addTilesById(newTileIds, model, scene)
    return model
  }

  addTilesToScene = (tiles: Tile[], scene: Scene) => {
    tiles.forEach(tile => {
      if (!tile.mesh) throw new Error("no mesh to add to scene");
      const tile3d = tile.mesh as Object3D
      scene.add(tile3d)
    })
  }
  
  // create

  getTileMeshById = async (tileIds: TileId[]) => {
    const tiles = this.initTileMeshById(tileIds)
    await this.textureService.applyTexture(tiles)
    // await this.textureService.applyMockTexture(tiles)
    // await this.textureService.applyDisplacementTexture(tiles)
    return tiles
  }

  getPlane = (size: number = 50, planeName: string = 'planeDefalut') => {
    const planGeo = new PlaneGeometry(size, size, 100, 100)
    const planMaterial = new MeshStandardMaterial({ color: 0xffffff, side: DoubleSide })
    const plane = new Mesh(planGeo, planMaterial)
    plane.name = planeName
    return plane
  }


  // remove tile

  removeTileFromModalById = (tileIdToRemove: TileId, array: Tile[]): Tile[] => array.filter(tile => !this.isTileIdEqual(tile.id, tileIdToRemove))
  removeTileFromScene = (tile3d: Object3D<THREE.Event>) => tile3d.removeFromParent()

  removeTile = (tile:Tile, tiles: Tile[]) => {
    if (tile.mesh) {
      this.removeTileFromScene(tile.mesh)
      tiles = this.removeTileFromModalById(tile.id, tiles)
      return tiles
    } else {
      throw new Error("No mesh to remove tile");
    }
  }

  removeTileById = (tileId: TileId, modal: Tile[], scene: Scene) => {
    const regexToken = `planeZ${tileId.z}X${tileId.x}Y${tileId.y}`
    const regex = new RegExp(regexToken);
    const tile3d = scene.children.find(mesh => regex.test(mesh.name))
    if (tile3d) {
      this.removeTileFromScene(tile3d)
      modal = this.removeTileFromModalById(tileId, modal)
      return modal
    } else {
      console.error(JSON.stringify(tileId), new Date().toISOString());
      throw new Error("no tile to remove");
    }
  }

  removeTileByIds = (ids: TileId[], tiles: Tile[], scene: Scene) => {
    ids.forEach(id => {
      tiles = this.removeTileById(id, tiles, scene)
    })
    return tiles
  }

  // caculation

  calculateChildTileIdsFromId = (fromTileId: TileId) => {
    const newTileIds: TileId[] = []
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        const newTileRes = fromTileId.z + 1
        const newTileX = fromTileId.x * 2 + x
        const newTileY = fromTileId.y * 2 + y
        const newTile: TileId = {
          z: newTileRes,
          x: newTileX,
          y: newTileY,
        }
        newTileIds.push(newTile)
      }
    }
    return newTileIds
  }

  calculateChildTileIdsFromIds = (fromTileIds: TileId[]) => {
    const newTileIds: TileId[] = []
    fromTileIds.forEach(fromTileId => {
      const forEachNewTileIds = this.calculateChildTileIdsFromId(fromTileId)
      newTileIds.push(...forEachNewTileIds)
    })
    return newTileIds
  }

  getTileCenter = (tile: Tile) => {
    const rate = Math.pow(2, tile.id.z - 8) // Magnificate Rate
    const tileWidth = 1 / rate * 12
    const tileCenterOffset = tileWidth / 2
    const tileCenterX = tileWidth * (tile.id.x - (this.initTileId.x * rate)) + tileCenterOffset
    const tileCenterY = tileWidth * (tile.id.y - this.initTileId.y * rate) + tileCenterOffset
    return new Vector3(tileCenterX, 0, tileCenterY)
  }

  getTileCorner = (tile: Tile) => {
    const rate = Math.pow(2, tile.id.z - 8) // Magnificate Rate
    const tileWidth = 1 / rate * 12
    const tileCenterX = tileWidth * (tile.id.x - (this.initTileId.x * rate))
    const tileCenterY = tileWidth * (tile.id.y - this.initTileId.y * rate)
    return new Vector3(tileCenterX, 0, tileCenterY)
  }

  // distance

  isAnyTileCloseToCamera = (tiles: Tile[], camera: Camera) => {
    const _getTileCameraDistances = (tiles: Tile[]) => {
      const distances: { tile: Tile, distance: number }[] = []
      const cameraPosition = camera.position.clone()
      const _getDistance = (tile: Tile) => {
        if (tile.mesh) {
          const distance = cameraPosition.distanceTo(tile.mesh.position)
          distances.push({ tile, distance })
        } else {
          console.error('no mesh to child');
        }
      }
      tiles.forEach(tile => _getDistance(tile))
      return distances
    }
    const lengthMapping = _getTileCameraDistances(tiles)
    const canTrunChild = lengthMapping.some(({ tile, distance }) => {
      console.log(tile.id.z, this.getDistanceThresholdOfTileToCamera(tile));
      
      return distance < this.getDistanceThresholdOfTileToCamera(tile)
    })
    return canTrunChild
  }

  getDistanceThresholdOfTileToCamera = (tile: Tile) => {
    switch (tile.id.z) {
      case 9:
        return 4
      case 8:
        return 10
      default:
        return 10 / ((tile.id.z - 8) * (tile.id.z - 8)) - 1 / (tile.id.z - 8) - 0.14
    }
  }

  tilesFarToCanvasCenter = (tiles: Tile[], canvasCenter: Vector3) => {
    return tiles.filter(tile => {
      const tileCenter = this.getTileCenter(tile)
      const tileCorner = this.getTileCorner(tile)
      const tileCenterToCanvasCenter = new Vector3().subVectors(tileCenter, canvasCenter).length()
      const tileCornerToCanvasCenter = new Vector3().subVectors(tileCenter, tileCorner).length()
      const tileCornerToOppositeCorner = tileCornerToCanvasCenter * 2
      const tileFarToCanvasCenter = tileCenterToCanvasCenter > tileCornerToOppositeCorner * 4
      return tileFarToCanvasCenter
    })
  }

  tilesCloseToCanvasCenter = (tiles: Tile[], canvasCenter: Vector3) => {
    return tiles.filter(tile => {
      const tileCenter = this.getTileCenter(tile)
      const tileCorner = this.getTileCorner(tile)
      const tileCenterToCanvasCenter = new Vector3().subVectors(tileCenter, canvasCenter).length()
      const tileCornerToCanvasCenter = new Vector3().subVectors(tileCenter, tileCorner).length()
      const tileCornerToOppositeCorner = tileCornerToCanvasCenter * 2
      const tileCloseToCanvasCenter = tileCenterToCanvasCenter < tileCornerToOppositeCorner
      return tileCloseToCanvasCenter
    })
  }

  // update

  updateTileToRaycaster = (tiles: Tile[]) => {
    const objToDetectIntersect = tiles.map(tile => tile.mesh as Object3D)
    this.animateService.removeIntersetObject('plane')
    this.animateService.passIntersetObject(objToDetectIntersect)
  }


}
