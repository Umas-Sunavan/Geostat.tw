import { Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, PlaneGeometry } from "three";
import { TileId } from "./TileId";

export interface Tile {
    id: TileId;
    mesh?: Mesh<PlaneGeometry, MeshStandardMaterial>
}