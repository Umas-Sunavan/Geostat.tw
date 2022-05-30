import { HttpClient, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, map, firstValueFrom, BehaviorSubject, switchMap, of, delay, concatMap, take, Observable, lastValueFrom } from 'rxjs';
import { Camera, DoubleSide, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, Scene, Texture, TextureLoader, Vector3 } from 'three';
import { TextureService } from './texture.service';
import { AnimateService } from '../three-services/animate.service';
import { TileUtilsService } from './tile-utils.service';
import { TileId } from 'src/app/shared/models/TileId';
import { Tile } from 'src/app/shared/models/Tile';

@Injectable({
  providedIn: 'root'
})
export class TileService {

  constructor(
    private tileUtilsService: TileUtilsService,
    private animateService: AnimateService,
  ) { }

  onUserUpdateCamera: BehaviorSubject<string> = new BehaviorSubject('')

  queueToUpdateResolution!: Observable<string>

  initTileIdsOfLevel8 = (): TileId[] => {
    const tiles = []
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 5; y++) {
        const eachTileId = {
          x: this.tileUtilsService.initTileId.x + x,
          y: this.tileUtilsService.initTileId.y + y,
          z: this.tileUtilsService.initTileId.z
        }
        tiles.push(eachTileId)
      }
    }
    return tiles
  }

  initTileMesh = (tiles: Tile[]) => {
    for (const tile of tiles) {
      const tileResolution = tile.id.z
      const rate = Math.pow(2, tileResolution - 8) // Magnificate Rate
      const tileWidth = 12 / rate
      const meshName = `planeZ${tile.id.z}X${tile.id.x}Y${tile.id.y}`
      const mesh = this.tileUtilsService.getPlane(tileWidth, meshName)
      const initTileX = this.tileUtilsService.initTileId.x * rate
      const initTileY = this.tileUtilsService.initTileId.y * rate
      const offset = 0.5
      mesh.position.setX(((tile.id.x - initTileX + offset)) * tileWidth)
      mesh.position.setZ(((tile.id.y - initTileY + offset)) * tileWidth)
      // mesh.position.setY(tile.id.z * 0.3)
      mesh.rotateX(-Math.PI * 0.5)
      tile.mesh = mesh
    }
  }
  initOnUserUpdateResolution = () => {
    this.onUserUpdateCamera.pipe(
      switchMap(value => of(value).pipe(delay(1000))) // abandon too-frequent emission
    ).pipe(
      concatMap(() => this.queueToUpdateResolution.pipe(take(1))) // add emission to queue
    ).subscribe()
  }

  // merge tiles

  checkSiblingsCanMerge = (tilesToCheck: Tile[], model:Tile[]) => {
    const _checkTilesAllExist = (tileIdsToCheck: TileId[]) => {
      const existMap = tileIdsToCheck.map(tileIdToCheck => {
        const isExist = model.some(tile => this.tileUtilsService.isTileIdEqual(tileIdToCheck, tile.id))
        return { tile: tileIdToCheck, isExist: isExist }
      })
      const isAllExist = existMap.every(isExist => isExist.isExist)
      return isAllExist
    }
    const siblingsOkToMerge = tilesToCheck.filter(tile => {
      const parentFromId = this.tileUtilsService.getIdFromChildTile(tile.id)
      if (parentFromId) {
        const siblingIds = this.tileUtilsService.calculateChildTileIdsFromId(parentFromId)
        const siblingsExist = _checkTilesAllExist(siblingIds)
        const siblingsAllFarToCanvasCenter = true
        return siblingsExist && siblingsAllFarToCanvasCenter
      } else {
        console.error("No parent tile");
        return false
      }
    })
    return siblingsOkToMerge
  }

  mergeTile = async (tilesToMerge: Tile[], model:Tile[], scene: Scene) => {

    const addTilesByIds = async (tileIds: TileId[], tiles: Tile[]) => {
      for (const tileId of tileIds) {
        if (tileId.z > 7) {
          tiles = await this.tileUtilsService.addTilesById([tileId], tiles, scene)
        }
      }
      return tiles
    }

    const hideTiles = (tiles: Tile[]) => {
      for (const tile of tiles) {
        if (tile.id.z > 7) {
          if (tile.mesh) {
            tile.mesh.traverse(object3d => {
              object3d.visible = false
            })
          }
        }
      }
      return tiles
    }

    const removeTiles = (tileIds: TileId[], tiles: Tile[]) => {
      for (const id of tileIds) {
        const tile = this.tileUtilsService.getTileById(tiles, id)
        if (tile?.mesh) {
          if (tile.id.z > 8) {
            tiles = this.tileUtilsService.removeTile(tile, tiles)
          }
        } else {
          throw new Error("incorrect tile mesh mapping");
        }
      } 
      return tiles
    }

    const showTiles = (tileIds: TileId[], tiles: Tile[]) => {
      for (const tileId of tileIds) {
        const tile = tiles.find(tile => this.tileUtilsService.isTileIdEqual(tile.id, tileId))
        if (tile?.mesh) {
          tile.mesh.traverse(object3d => {
            object3d.visible = true
          })
        } else {
          throw new Error("incorrect tile mesh mapping");
        }
      }
    }

    const parentTileIdsToAdd = tilesToMerge.map( parentTile => this.tileUtilsService.getIdFromChildTile(parentTile.id))
    const uniqueParentTileIdsToAdd = this.tileUtilsService.tilesFilterDuplicateByIds(parentTileIdsToAdd)
    const childTileIds = this.tileUtilsService.calculateChildTileIdsFromIds(uniqueParentTileIdsToAdd)
    let uniqueParentTileToAdd = uniqueParentTileIdsToAdd.map( tileId => {return {id: tileId} as Tile})
    model = await addTilesByIds(uniqueParentTileIdsToAdd, model)
    uniqueParentTileToAdd = hideTiles(uniqueParentTileToAdd)
    model = removeTiles(childTileIds, model)
    showTiles(uniqueParentTileIdsToAdd, model)
    return model
  }

  getMergingTiles = (fromTiles: Tile[], cameraPosition: Vector3, canvasCenter: Vector3) => {
    const tilesFarToCamera = this.tileUtilsService.tilesFarToCamera(fromTiles, cameraPosition)
    const tilesToTurnParent = this.tileUtilsService.tilesFarToCanvasCenter(fromTiles, canvasCenter)
    let tilesToMerge: Tile[] = []
    tilesToMerge.push(...tilesToTurnParent, ...tilesFarToCamera)
    tilesToMerge = this.tileUtilsService.tilesFilterDuplicate(tilesToMerge)
    tilesToMerge = this.checkSiblingsCanMerge(tilesToMerge, fromTiles)
    tilesToMerge = tilesToMerge.filter( tile => tile.id.z > 8)
    return tilesToMerge
  }

  splitTiles = async (tilesToSplit:Tile[], _fromTiles: Tile[], scene:Scene) => {
    const tileIdsToSplit = tilesToSplit.map( tile => tile.id)
    _fromTiles = await this.tileUtilsService.addChildTile(tileIdsToSplit, _fromTiles, scene)
    _fromTiles = this.tileUtilsService.removeTileByIds(tileIdsToSplit, _fromTiles, scene)
    return _fromTiles
  }

  updateTilesResolution = async (model: Tile[], scene:Scene, camera: Camera):Promise<Tile[]> => {

    const checkSplitTiles = async (fromTiles: Tile[], canvasCenter: Vector3) => {
      let tilesToSplit = this.tileUtilsService.tilesCloseToCanvasCenter(fromTiles, canvasCenter)
      let cameraZoomedEnough = this.tileUtilsService.isAnyTileCloseToCamera(tilesToSplit, camera)
      let repeatCheck = tilesToSplit.length > 0 && cameraZoomedEnough
      while (repeatCheck) {
        try {
          fromTiles = await this.splitTiles(tilesToSplit, fromTiles, scene)
        } catch (error) {
          console.warn('abandon removing ', tilesToSplit.map(tile => JSON.stringify(tile.id)).join(', '));
        }
        cameraZoomedEnough = this.tileUtilsService.isAnyTileCloseToCamera(tilesToSplit, camera)
        tilesToSplit = this.tileUtilsService.tilesCloseToCanvasCenter(fromTiles, canvasCenter)
        repeatCheck = tilesToSplit.length > 0 && cameraZoomedEnough
      }
      return fromTiles
    }

    const checkMergeTiles = async (_model: Tile[], canvasCenter: Vector3) => {
      let tilesToMerge = this.getMergingTiles(_model, camera.position, canvasCenter)
      while (tilesToMerge.length !== 0) {
        try {
          _model = await this.mergeTile(tilesToMerge, _model, scene)
          tilesToMerge = this.getMergingTiles(_model, camera.position, canvasCenter)
        } catch (error) {
          console.warn('abandon merging')
          console.warn(error)
        }
      }
      return _model
    }
    const canvasCenter: Vector3 | undefined = this.animateService.getCanvasCenter()
    if (canvasCenter) {
      model = await checkSplitTiles(model, canvasCenter)
      model = await checkMergeTiles(model, canvasCenter)
    }
    return model
  }
}
