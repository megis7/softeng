import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { PriceLite } from 'src/models/price';
import { environment as env } from '../environments/environment';
import { map } from 'rxjs/operators';
import { PriceResult } from '../models/price-result';

@Injectable()
export class PriceService {

    private prices =  [
        {"price": 10.00, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 0, "productIndex": 0},
        {"price": 11.20, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 1, "productIndex": 0},
        {"price": 10.54, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 2, "productIndex": 0},
        {"price": 32.99, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 0, "productIndex": 1},
        {"price": 36.99, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 1, "productIndex": 1},
        {"price": 37.99, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 2, "productIndex": 1},
        {"price": 97.30, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 0, "productIndex": 2},
        {"price": 92.90, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 1, "productIndex": 2},
        {"price": 90.00, "dateFrom":  "2019-02-23", "dateTo":  "2019-02-24", "shopIndex": 2, "productIndex": 2}
      ]

    private url = `${env.baseURL}/prices`;

    constructor(
        private http: HttpClient
    ){}

    toDateString(date: Date) {
        let d = date,
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        return [year, month, day].join('-');
    }

    getPrices(start: number = 0, count: number = 20, geoDist: number= -1, geoLng: number = -1, geoLat: number = -1, dateFrom: Date = new Date(),
        dateTo: Date = new Date(), shops: string[] = [], products: string[] = [], tags: string[] = [], sort: string = "price|ASC"): Observable<PriceResult[]> {
        let params = new HttpParams().set('start', start.toString())
                                       .set('count', count.toString())
                                       .set('dateFrom',this.toDateString(dateFrom))
                                       .set('dateTo',this.toDateString(dateTo))
                                       .set('sort', sort);
        if(geoDist != -1 && geoLng != -1 && geoLat != -1)
            params = params.set('geoDist',geoDist.toString())
                            .set('geoLng',geoLng.toString())
                            .set('geoLat',geoLat.toString())
        shops && shops.forEach( shop => params = params.append('shops',shop))
        products && products.forEach( product => params = params.append('products',product))
        tags && tags.forEach( tag => params = params.append('tags',tag))

        return this.http.get<{start: number, count: number, total: number, prices: PriceResult[]}>(this.url, { params: params })
                        .pipe(map(res => res.prices));
        //return of(this.prices.map(x => Object.assign({}, x)));
    }

    postPrice(newPrice: PriceLite): Observable<PriceResult> {
        return this.http.post<PriceResult>(this.url, newPrice);
    }
}