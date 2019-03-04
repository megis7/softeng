import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Shop } from 'src/models/shop';
import { environment as env } from '../environments/environment';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ShopService {

    private url = `${env.baseURL}/shops`;

    private shops = [{"tags":[],"withdrawn":false,"name":"δοκιμαστικο","address":"Παλαιο Φαληρο","lng":23.70330333709717,"lat":37.93123007760046,"id":"5c7d1c8695188b53f0c060d6"},{"tags":[],"withdrawn":false,"name":"Alimos-Grigoris","address":"Αλιμος","lng":23.710384368896488,"lat":37.91201801036502,"id":"5c7d1c3395188b53f0c060d5"},{"tags":[],"withdrawn":false,"name":"Γρηγορης-Αλιμος","address":"Αλιμος","lng":23.721483,"lat":37.911041,"id":"5c7cea81f9dfaf1501de85b1"}]
    
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
        // return of(this.shops.map(x => Object.assign({}, x)))
    }

    getShopsPaged(start: number = 0, count: number = 20, status: string = "ACTIVE", sort: string = "id|DESC"): 
        Observable<{start: number, count: number, total: number, shops: Shop[]}> {
            const params = new HttpParams().set('start', start.toString())
                                       .set('count', count.toString())
                                       .set('status', status)
                                       .set('sort', sort);
        // return of({start: start, count: count, total: this.shops.length, shops: this.shops.slice(start, start + count).map(x => Object.assign({}, x))});
        return this.http.get<{start: number, count: number, total: number, shops: Shop[]}>(this.url, { params: params })
                        .pipe(map(res => this.mapPagesShops(res)))
}   

    getShop(id: string): Observable<Shop> {
        return this.http.get<Shop>(`${this.url}/${id}`);
        // return of(this.shops.find(x => x.id == id))
    }

    postShop(newShop: Shop): Observable<Shop> {
        const {id, ...rest} = newShop;
        return this.http.post<Shop>(`${this.url}`,rest);
    }

    putShop(shop: Shop): Observable<Shop> {
        const {id, ...rest} = shop;
        return this.http.put<Shop>(`${this.url}/${id}`,rest);
    }

    patchShop(shop: Shop,field: string): Observable<Shop> {
        const toSend = JSON.parse(`{"${field}": ${JSON.stringify(shop[field])}}`);
        return this.http.patch<Shop>(`${this.url}/${shop.id}`,toSend);
    }

    deleteShop(id: string): Observable<{message: string}> {
        return this.http.delete<{message: string}>(`${this.url}/${id}`);
        // this.shops.splice(this.shops.findIndex(x => x.id == id), 1)
        // return of({"message":"OK"})
    }

    private mapPagesShops(res: {start: number, count: number, total: number, shops: Shop[]}):
        {start: number, count: number, total: number, shops: Shop[]} {
            return{ start: res.start, count: Math.min(res.count, res.total - res.start), total: res.total, shops: res.shops}
    }
}