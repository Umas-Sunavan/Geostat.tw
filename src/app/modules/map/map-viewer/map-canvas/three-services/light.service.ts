import { Injectable } from '@angular/core';
import { AmbientLight, HemisphereLight, PointLight, PointLightHelper, Scene } from 'three';

@Injectable({
  providedIn: 'root'
})
export class LightService {

  constructor() { }

  makeLight = (scene: Scene) => {
    this.makeAmbientLight(scene)
    this.makePointLight(scene)
  }

  makePointLight = (scene: Scene) => {
    const light = new PointLight(0xffffff, 0.5)
    light.position.set(40, 20, 10)
    const pointLightHelper = new PointLightHelper(light, 5, 0x000000)
    scene.add(light)
    scene.add(pointLightHelper)
  }

  makeAmbientLight = (scene: Scene) => {
    const light = new AmbientLight(0xffffff, 0.7)
    light.position.set(0, 20, 10)
    scene.add(light)
  }
}
