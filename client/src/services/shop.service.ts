import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Shop } from 'src/models/shop';
import { environment as env } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class ShopService {

    private url = `${env.baseURL}/shops`;

    constructor(
        private http: HttpClient
    ){}

    getShops(start: number = 0, count: number = 20, status: string = "ACTIVE", sort: string = "id|DESC"): Observable<Shop[]> {
        const params = new HttpParams().set('start', start.toString())
                                       .set('count', count.toString())
                                       .set('status', status)
                                       .set('sort', sort);

        return this.http.get<{start: number, count: number, total: number, shops: Shop[]}>(this.url, { params: params })
                        .pipe(map(res => res.shops));
    }

    getShop(id: string): Observable<Shop> {
        return this.http.get<Shop>(`${this.url}/${id}`);
    }

    postShop(newShop: Shop): Observable<Shop> {
        const {_id, ...rest} = newShop;
        return this.http.post<Shop>(`${this.url}`,rest);
    }

    putShop(shop: Shop): Observable<Shop> {
        const {_id, ...rest} = shop;
        return this.http.put<Shop>(`${this.url}/${_id}`,rest);
    }

    patchShop(shop: Shop,field: string): Observable<Shop> {
        const toSend = JSON.parse(`{"${field}": ${JSON.stringify(shop[field])}}`);
        return this.http.patch<Shop>(`${this.url}/${shop._id}`,toSend);
    }

    deleteShop(id: string): Observable<{message: string}> {
        return this.http.delete<{message: string}>(`${this.url}/${id}`);
    }
}