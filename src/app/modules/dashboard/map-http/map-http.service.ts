import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpMap } from 'src/app/shared/models/MapHttp';

@Injectable({
  providedIn: 'root'
})
export class MapHttpService {

  constructor(
    private httpClient: HttpClient
  ) { }


  getMaps = () => {
    return this.httpClient.get<HttpMap[]>('https://us-central1-twgeostat.cloudfunctions.net/getDB/maps')
  }

  getMockMaps = ():Observable<HttpMap[]> => {
    return of(
      [
        { "mapId": 1, "mapName": "分店資料", "createdTime": "2022-05-22T03:34:43Z", "creator": "admin", "defualtCategoryId": "-N-SasgrgpgWs2szH-aH" },
        { "mapId": 2, "mapName": "簡報用地圖", "createdTime": "2022-05-24T05:35:35Z", "creator": "admin", "defualtCategoryId": "-N1hLpiGatywxzYbbuJy" },
        { "mapId": 3, "mapName": "開張分店地圖", "createdTime": "2022-05-24T13:05:06Z", "creator": "admin", "defualtCategoryId": "adwqfeswdq" },
        { "mapId": 4, "mapName": "開張分店地圖", "createdTime": "2022-05-24T13:09:58Z", "creator": "admin", "defualtCategoryId": "adwqfeswdq" },
        { "mapId": 5, "mapName": "實體行銷舉辦分店地圖", "createdTime": "2022-05-24T13:13:31Z", "creator": "admin", "defualtCategoryId": "-N-SasgrgpgWs2szH-aH" }]
    )
  }

  deleteMap = (id: number):Observable<{message:string}> => {
    let headers = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded')
    return this.httpClient.delete<{message:string}>(`https://us-central1-twgeostat.cloudfunctions.net/getDB/maps/${id}`, {headers})
  }

  renameMap = (id: number, name: string):Observable<{message:string}> => {
    let headers = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded')
    let body = new URLSearchParams();
    body.set('name', name);
    return this.httpClient.post<{message:string}>(`https://us-central1-twgeostat.cloudfunctions.net/getDB/maps/${id}/rename`, body.toString(), { headers })
  }

  addMap = (name: string, creator: string, defaultCategoryId: string, mapOptionId: string):Observable<{message:string, id: string, name: string}> => {
    let body = new URLSearchParams();
    body.set('name', name);
    body.set('creator', creator);
    body.set('defualtCategoryId', defaultCategoryId);
    body.set('mapSettingId', mapOptionId);
    // const body = {
    //   name:name,
    //   creator: creator,
    //   defualtCategoryId: defaultCategoryId,
    //   mapSettingId: mapOptionId
    // }
    let headers = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded')
    // let headers = new HttpHeaders().set('content-type', 'multipart/form-data')
    return this.httpClient.post<{message:string, id: string, name: string}>(`https://us-central1-twgeostat.cloudfunctions.net/getDB/maps/`, body.toString(), { headers })
  }

  getMap = (id: number) => {
    return this.httpClient.get<HttpMap>(`https://us-central1-twgeostat.cloudfunctions.net/getDB/maps/${id}`)
  }

  changeDefaultCategory = (mapId: string, categoryId: string) => {
    const headers = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded')
    let body = new URLSearchParams();
    body.set("category", categoryId)
    return this.httpClient.post<{message:string}>(`https://us-central1-twgeostat.cloudfunctions.net/getDB/maps/${mapId}/category`, body.toString(), { headers })
  }
}
