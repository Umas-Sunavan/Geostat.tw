import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, filter, lastValueFrom, Subject, take } from 'rxjs';
import { Observable, of } from 'rxjs';
import { BoxGeometry, Camera, Color, DirectionalLight, Group, Intersection, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Raycaster, Renderer, RepeatWrapping, Scene, ShaderMaterial, Texture, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Injectable({
  providedIn: 'root'
})
export class AnimateService {

  onFrameRender!: BehaviorSubject<{ renderer: WebGLRenderer, raycaster: Raycaster }>
  onMouseIntersect: BehaviorSubject<Intersection<Object3D<Event>>[]> = new BehaviorSubject([] as Intersection<Object3D<Event>>[])
  onCanvasIntersect: BehaviorSubject<Intersection<Object3D<Event>>[]> = new BehaviorSubject([] as Intersection<Object3D<Event>>[])
  mouseRaycaster = new Raycaster();
  cavasCenterRaycaster = new Raycaster()
  intersectedObjs: (Object3D | Group)[] = []
  isPaused: boolean = false
  renderer?: WebGLRenderer
  scene?: Scene
  camera?: Camera
  orbitControl?: OrbitControls
  mouse?: Vector2
  isNeedImageData: boolean = false
  imageUrl:BehaviorSubject<string> = new BehaviorSubject('')

  constructor(
  ) {
  }

  getCavasImage = () => {
    this.isNeedImageData = true
    return this.imageUrl.pipe(filter( value => Boolean(value)))
  }


  animate = (frameMax: number = 36000) => {
    if(!this.renderer||!this.scene||!this.camera||!this.orbitControl||!this.mouse) return
    if (this.renderer.info.render.frame > frameMax) return
    if (this.isPaused) return 
    this.mouseRaycaster.setFromCamera(this.mouse, this.camera);
    this.cavasCenterRaycaster.setFromCamera(new Vector2(0,0), this.camera);
    requestAnimationFrame(() => {
      this.animate()
      if(!this.renderer) return
      this.onFrameRender.next({ renderer: this.renderer, raycaster: this.mouseRaycaster })
    });

    this.renderer.render(this.scene, this.camera);

    if(this.isNeedImageData == true){
      const imgData = this.renderer.domElement.toDataURL();
      console.log(imgData);
      
      this.imageUrl.next(imgData)
      this.isNeedImageData = false;
    }
    // orbitControl.update()
    this.onIntersections()
  }

  pauseAnimation = () => this.isPaused = true

  resumeAnimation = () => {
    this.isPaused = false
    this.animate()
  }

  onIntersections = () => {
    const intersects:Intersection<Object3D<Event>>[] = this.mouseRaycaster.intersectObjects(this.intersectedObjs)
    this.onMouseIntersect.next(intersects)    
    const canvasCenterIntersects:Intersection<Object3D<Event>>[] = this.cavasCenterRaycaster.intersectObjects(this.intersectedObjs)
    this.onCanvasIntersect.next(canvasCenterIntersects)    
  }

  initAnimate = (renderer: WebGLRenderer, scene: Scene, camera: Camera, orbitControl: OrbitControls, mouse: Vector2) => {
    this.onFrameRender = new BehaviorSubject({ renderer: renderer, raycaster: this.mouseRaycaster })
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.orbitControl = orbitControl
    this.mouse = mouse
  }

  passIntersetObject = (objects: (Object3D| Group)[]) => {
    this.intersectedObjs.push(...objects)
  }

  removeIntersetObject = (selector: string) => {
    this.intersectedObjs = this.intersectedObjs.filter( obj => !obj.name.includes(selector))
  }

  getCanvasCenter = (): Vector3 | undefined => this.onCanvasIntersect.value[0]?.point

  
}
