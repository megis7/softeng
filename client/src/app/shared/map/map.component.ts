import { Component, OnInit, Input, Output, EventEmitter, IterableDiffers, DoCheck } from '@angular/core';
import * as ol from 'openlayers';
import { Point } from 'src/models/point';
import { GeocodeService } from 'src/services/geocode.service';
import { PriceResult } from 'src/models/price-result';
import { ShopPrice } from 'src/models/shop-price';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, DoCheck {

	constructor(
		private _iterableDiffers: IterableDiffers,
		private geocodeService: GeocodeService) { this.iterableDiffer = this._iterableDiffers.find([]).create(null); }

	map: ol.Map;
	vectorLayer: ol.layer.Vector;
	vectorSource: ol.source.Vector;

	@Input() initialPosition: [number, number] = [23, 38];
	@Input() initialZoom = 7;
	@Input() mapPoints: ShopPrice[] = null;
	@Output() clicked = new EventEmitter<Point>();
	@Output() shopClicked = new EventEmitter<ShopPrice[]>();

	private coordinates: Point[] = new Array<Point>();
	private coffeeShopIconPath = "assets/images/coffee-shop.png"
	private homePath = "assets/images/home-icon.png"
	private isClickable = false;

	private mapInitialized = false;
	private iterableDiffer;

	ngOnInit() {
		this.vectorSource = new ol.source.Vector();
		this.vectorLayer = new ol.layer.Vector({ source: this.vectorSource })

		this.map = new ol.Map({
			target: 'map-container',
			view: new ol.View({ center: ol.proj.fromLonLat(this.initialPosition), zoom: this.initialZoom }),
			layers: [
				new ol.layer.Tile({ source: new ol.source.OSM() }),
				this.vectorLayer
			],
			controls: []
		})

		this.mapInitialized = true;

		this.map.on('click', this.handleMapClick)
	}

	ngDoCheck(): void {

		if (this.mapPoints == null)		// this feature is not always used
			return;

		let changes = this.iterableDiffer.diff(this.mapPoints);

		if (changes && this.mapInitialized) {
			let newPoints: ShopPrice[] = changes.collection;

			this.removeAllPoints();
			newPoints.forEach(p => this.addPoint(null, p))
		}
	}

	public addPoint(coordinates: Point, shopPrice: ShopPrice = null) {

		if (coordinates != null) {
			this.coordinates.push(coordinates);

			const coords: [number, number] = ol.proj.fromLonLat([coordinates.lon, coordinates.lat]);

			let feature = new ol.Feature(new ol.geom.Point(coords));
			feature.setStyle(this.createIconStyle(this.coffeeShopIconPath, undefined));
			feature.setProperties({ name: 'test point', value: 15 });

			this.vectorSource.addFeature(feature);
		} 
		else {
			this.coordinates.push(new Point(shopPrice.shopLng, shopPrice.shopLat));
			const coords: [number, number] = ol.proj.fromLonLat([shopPrice.shopLng, shopPrice.shopLat]);

			let feature = new ol.Feature(new ol.geom.Point(coords));
			feature.setStyle(this.createIconStyle(((shopPrice.type == "shop")?this.coffeeShopIconPath:this.homePath), undefined));
			feature.setProperties({ shop: shopPrice });

			this.vectorSource.addFeature(feature);
		}
	}

	public setPosition(point: Point) {
		const position: [number, number] = [point.lon, point.lat]
		const zoomLevel = this.map.getView().getZoom();

		this.map.setView(new ol.View({ center: ol.proj.fromLonLat(position), zoom: zoomLevel }))
	}

	public setZoom(level: number) {
		const center = this.map.getView().getCenter();
		this.map.setView(new ol.View({ center: center, zoom: level }))
	}

	public setClickable(state: boolean) {
		this.isClickable = state;
	}

	public removeAllPoints() {
		this.vectorSource.clear();
	}

	private createIconStyle(src: string, img: any): ol.style.Style {
		const icon = new ol.style.Icon({
			anchor: [0.5, 0.5],
			crossOrigin: 'anonymous',
			src: src,
			img: img,
			scale: 0.5,
			imgSize: img ? [img.width, img.height] : undefined
		})

		return new ol.style.Style({
			image: icon
		})
	}

	private handleMapClick = (evt: any) => {

		let shops: ShopPrice[] = []
		this.map.forEachFeatureAtPixel(evt.pixel, f => { shops.push(f.getProperties().shop) });

		if(shops.length > 0)
			this.shopClicked.next(shops);


		if (this.isClickable == false)
			return;

		const coords = this.map.getCoordinateFromPixel(evt.pixel);
		const point = new Point(...ol.proj.toLonLat(coords));

		// check if an icon already exists at the pixel given
		let found = false;
		this.map.forEachFeatureAtPixel(evt.pixel, f => { found = true });

		if (found)
			return;

		this.removeAllPoints();

		let feature = new ol.Feature(new ol.geom.Point(coords));
		feature.setStyle(this.createIconStyle(this.coffeeShopIconPath, undefined));
		feature.setProperties({ name: 'test point', value: 15 });

		this.vectorSource.addFeature(feature);

		// TODO: this line is replaced with servie observable
		// this.clicked.next(point)

		this.geocodeService.mapClickedSubject.next(point)
	}
}
