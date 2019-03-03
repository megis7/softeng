import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Shop } from 'src/models/shop';
import { environment as env } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class ShopService {

    private url = `${env.baseURL}/shops`;

    private shops = [
        {"id":"1","name":  "Κατάστημα Χαλκίδας", "address": "Κριεζώτου 14, T.K. 34100, Χαλκίδα", "lat": 38.46361, "lng": 23.59944,
          "tags": ["Μουσική", "Υπολογιστές"]
        },
        {"id":"2","name":  "Κατάστημα Ψυχικού", "address": "Διονυσίου Σολωμού 3, T.K. 15451, Ψυχικό", "lat": 38.01324, "lng": 23.77223,
          "tags": ["Μουσική", "Υπολογιστές", "Βιβλία"]
        },
        {"id":"3","name":  "Κατάστημα Αγίας Παρασκευής", "address": "Λεωφόρος Μεσογείων 402, T.K. 15342, Αγία Παρασκευή", "lat": 38.01667, "lng": 23.83333,
          "tags": ["Κινητά", "Υπολογιστές", "Βιβλία"]
        }
    ]
    
    constructor(
        private http: HttpClient
    ){}

    getShops(start: number = 0, count: number = 20, status: string = "ACTIVE", sort: string = "id|DESC"): Observable<Shop[]> {
        const params = new HttpParams().set('start', start.toString())
                                       .set('count', count.toString())
                                       .set('status', status)
                                       .set('sort', sort);

        //return this.http.get<{start: number, count: number, total: number, shops: Shop[]}>(this.url, { params: params })
        //                .pipe(map(res => res.shops));
        return of(this.shops.map(x => Object.assign({}, x)))
    }

    getShopsPaged(start: number = 0, count: number = 20, status: string = "ACTIVE", sort: string = "id|DESC"): 
        Observable<{start: number, count: number, total: number, shops: Shop[]}> {
        return of({start: start, count: count, total: this.shops.length, shops: this.shops.slice(start, start + count).map(x => Object.assign({}, x))});
}   

    getShop(id: string): Observable<Shop> {
        //return this.http.get<Shop>(`${this.url}/${id}`);
        return of(this.shops.find(x => x.id == id))
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
        // return this.http.delete<{message: string}>(`${this.url}/${id}`);
        this.shops.splice(this.shops.findIndex(x => x.id == id), 1)
        return of({"message":"OK"})
    }
}