import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, firstValueFrom, lastValueFrom, of, take } from 'rxjs';
import { Color, Texture, TextureLoader } from 'three';
import { Tile } from 'src/app/shared/models/Tile';
import { TileId } from 'src/app/shared/models/TileId';
import { TileUtilsService } from './tile-utils.service';
import { TileService } from './tile.service';

@Injectable({
  providedIn: 'root'
})
export class TextureService {

  constructor(
    private httpClient: HttpClient
  ) { }

  textureMapppingCacheAndId: { texture: ArrayBuffer, id: TileId }[] = []


  applyTexture = async (tiles: Tile[]) => {
    for (const tile of tiles) {
      const arrayBuffer = await this.getTextureFromCache(tile.id);
      const base64 = this.arrayBufferToBase64(arrayBuffer)
      const texture = await this.getTextureByTextureLoader(base64)
      if (!tile.mesh) throw new Error("no mesh to apply texture!");
      tile.mesh.material.map = texture
      tile.mesh.material.needsUpdate = true;
    }
  }

  getTextureFromCache = async (tileId: TileId) => {
    const mappingInCache = this.textureMapppingCacheAndId.find(mapping => 
      this.isTileIdEqualInTextureService(tileId, mapping.id))

    if (mappingInCache) {
      console.log(mappingInCache);
      return mappingInCache.texture
    } else {
      console.log('get from internet');

      const newTexutre = await this.getTextureBuffer(tileId)
      const newMapping = { id: tileId, texture: newTexutre }
      this.textureMapppingCacheAndId.push(newMapping)
      return newTexutre
    }
  }

  getTextureBuffer = async (tileId: TileId): Promise<ArrayBuffer> => {
    const options = {
      responseType: 'arraybuffer' as const,
    };
    // return firstValueFrom(this.httpClient.get(`https://tile.openstreetmap.org/${tileId.z}/${tileId.x}/${tileId.y}.png`, options))
    // return firstValueFrom(this.httpClient.get(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/512/${tileId.z}/${tileId.x}/${tileId.y}?access_token=pk.eyJ1IjoidW1hc3Nzc3MiLCJhIjoiY2wwb3l2cHB6MHhwdDNqbnRiZnV1bnF5MyJ9.oh8mJyUQCRsnvOurebxe7w`, options))
    return firstValueFrom(this.httpClient.get(`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/512/${tileId.z}/${tileId.x}/${tileId.y}?access_token=pk.eyJ1IjoidW1hc3Nzc3MiLCJhIjoiY2wwb3l2cHB6MHhwdDNqbnRiZnV1bnF5MyJ9.oh8mJyUQCRsnvOurebxe7w`, options))
  }

  applyMockTexture = async (tiles: Tile[]) => {
    for (const tile of tiles) {
      const getRandomByte = () => Math.floor(Math.random() * 255)
      const r = getRandomByte().toString(16)
      const g = getRandomByte().toString(16)
      const b = getRandomByte().toString(16)
      const color = new Color(+('0x' + r + g + b))
      // const arrayBuffer = await this.tileService.getTextureBuffer(tile.id);      
      // const base64 = this.arrayBufferToBase64(arrayBuffer)
      // const texture = await this.getTextureByTextureLoader(base64)
      if (!tile.mesh) throw new Error("no mesh to apply texture!");
      tile.mesh.material.color = color
      tile.mesh.material.needsUpdate = true;
    }
    return lastValueFrom(of('').pipe(delay(100) ))
  }

  arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8ClampedArray(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:image/jpg;base64,' + window.btoa(binary);
  }

  applyDisplacementTexture = async (tiles: Tile[]) => {
    tiles.forEach(async (tile: Tile, i) => {

      // for (let i = 0; i < tiles.length; i++) {
      // const tile = tiles[i];
      const src = this.getHeightTileSrc(tile.id.z, tile.id.x, tile.id.y)
      const leftSrc = this.getHeightTileSrc(tile.id.z, tile.id.x - 1, tile.id.y)
      const topSrc = this.getHeightTileSrc(tile.id.z, tile.id.x, tile.id.y - 1)
      const { canvas, imageData, leftImageData, topImageData } = await this.loadImagesFromSrc(src, leftSrc, topSrc)
      const dataUrl = await this.getHeightDataUrl(canvas, imageData, leftImageData, topImageData)
      if (!tile.mesh) throw new Error("no mesh to apply height texture");
      const heightTexture = await this.getTextureByTextureLoader(dataUrl)
      tile.mesh.material.displacementMap = heightTexture
      // tile.mesh.material.map = heightTexture
      tile.mesh.material.needsUpdate = true;
      // }
    })
  }

  getTextureByTextureLoader = async (base64: string): Promise<Texture> => {
    const textureLoader = new TextureLoader()
    return await textureLoader.loadAsync(base64);
  }

  loadImagesFromSrc = (src: string, leftSrc: string, topSrc: string): Promise<{ canvas: HTMLCanvasElement, imageData: ImageData, leftImageData: ImageData, topImageData: ImageData }> => {
    return new Promise((resolve, reject) => {
      // to connect all edges, one should use neightbor tile's data
      this.loadImage(src, (imageData, canvas) => {
        this.loadImage(leftSrc, leftImageData => {
          this.loadImage(topSrc, topImageData => {
            resolve({ canvas, imageData, leftImageData, topImageData })
          })
        })
      })
    })
  }

  loadImage = (src: string, onImageLoaded: (imageData: ImageData, canvas: HTMLCanvasElement) => void) => {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = this.createCanvasFromImage(img)
      const context = canvas.getContext("2d")
      if (!context) throw new Error("no context");
      const imageData = context.getImageData(0, 0, 256, 256)
      onImageLoaded(imageData, canvas)
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = src;
    }
  }

  createCanvasFromImage = (img: HTMLImageElement) => {
    const canvas: HTMLCanvasElement = document.createElement('CANVAS') as HTMLCanvasElement
    const context = canvas.getContext('2d')!;
    canvas.height = 256;
    canvas.width = 256;
    context.drawImage(img, 0, 0);
    return canvas
  }

  getHeightDataUrl = (canvas: HTMLCanvasElement, imageData: ImageData, leftImageData: ImageData, topImageData: ImageData): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.convertRawToHeight(imageData, leftImageData, topImageData)
      const context = canvas.getContext("2d")
      if (!context) throw new Error("No Context!");
      context.putImageData(imageData, 0, 0)
      const dataURL = canvas.toDataURL('png');
      resolve(dataURL)
    })
  }

  convertRawToHeight = (imageData: ImageData, leftImageData: ImageData, topImapeData: ImageData) => {
    // connect top edge
    for (let x = 0; x < topImapeData.width; x++) {
      const bottomEdgePxPosition = this.getBottomEdgePxPosition(topImapeData, x)
      this.setupHeight(bottomEdgePxPosition, topImapeData, imageData, x, 0)
    }
    for (let y = 1; y < imageData.height; y++) {
      // connect left edge
      const rightEdgePxPosition = this.getRightEdgePxPosition(leftImageData, y)
      this.setupHeight(rightEdgePxPosition, leftImageData, imageData, 0, y)

      for (let x = 1; x < imageData.width; x++) {
        const pxPosition = (y * imageData.width + x)
        this.setupHeight(pxPosition, imageData, imageData, x, y)
      }
    }
  }

  getRightEdgePxPosition = (tile: ImageData, y: number) => (tile.width) * (y + 1) - 1

  getBottomEdgePxPosition = (tile: ImageData, x: number) => (tile.height - 1) * tile.width + x

  setupHeight = (pxPosition: number, sourceTile: ImageData, outputTile: ImageData, x: number, y: number) => {
    const height = this.getHeight(pxPosition, sourceTile)
    this.applytHeight(outputTile, x, y, height)
  }

  getHeight = (pxPosition: number, imageData: ImageData) => {
    const colorPosition = pxPosition * 4
    const r = imageData.data[colorPosition]
    const g = imageData.data[colorPosition + 1]
    const b = imageData.data[colorPosition + 2]
    const height = this.getHeightFromColors(r, g, b)
    return height
  }

  getHeightFromColors = (r: number, g: number, b: number) => {
    const height = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1)
    // 1946.6 ~ -10.8
    const normalHeight = (height + 10.8) / 3800
    const byteHeight = Math.floor(normalHeight * 256)
    return byteHeight
  }

  applytHeight = (imageData: ImageData, x: number, y: number, height: number) => {
    const colorPosition = (y * imageData.width + x) * 4
    imageData.data[colorPosition] = height
    imageData.data[colorPosition + 1] = height
    imageData.data[colorPosition + 2] = height
  }

  getHeightTileSrc = (z: number, x: number, y: number) => {
    console.log({ z, x, y });
    return `http://localhost:3000/${z}/${x}/${y}.pngraw`
    // return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=pk.eyJ1IjoidW1hc3Nzc3MiLCJhIjoiY2wwb3l2cHB6MHhwdDNqbnRiZnV1bnF5MyJ9.oh8mJyUQCRsnvOurebxe7w`
  }

  isTileIdEqualInTextureService = (aId: TileId, bId: TileId) => {
    const sameX = aId.x === bId.x
    const sameY = aId.y === bId.y
    const sameZ = aId.z === bId.z
    return sameX && sameY && sameZ
  }

}
