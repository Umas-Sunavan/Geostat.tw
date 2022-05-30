import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { MapCanvasComponent } from './modules/map/map-viewer/map-canvas/map-canvas.component';
import { MapViewerComponent } from './modules/map/map-viewer/map-viewer.component';

const routes: Routes = [
  {
    path: 'map/:id',
    component: MapViewerComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
