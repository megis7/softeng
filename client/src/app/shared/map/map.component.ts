import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as ol from 'openlayers';
import { Point } from 'src/models/point';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

	constructor() { }

	map: ol.Map;
	vectorLayer: ol.layer.Vector;
	vectorSource: ol.source.Vector;

	@Input() initialPosition: [number, number] = [23, 38];
	@Input() initialZoom = 7;
	@Output() clicked = new EventEmitter<Point>();
	
	private coordinates: Point[] = new Array<Point>();
	private coffeeShopIconPath = "assets/images/coffee-shop.png"
	private isClickable = false;

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

		this.map.on('click', this.handleMapClick)
	}

	public addPoint(coordinates : Point) {
		this.coordinates.push(coordinates);

		const coords: [number, number] = ol.proj.fromLonLat([coordinates.lon, coordinates.lat]);

		let feature = new ol.Feature(new ol.geom.Point(coords));
		feature.setStyle(this.createIconStyle(this.coffeeShopIconPath, undefined));
		feature.setProperties({ name: 'test point', value: 15 });

		this.vectorSource.addFeature(feature);
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

	// TODO: no longer needed
	private handleMapClick = (evt: any) => {
		if(this.isClickable == false)
			return;

		const coords = this.map.getCoordinateFromPixel(evt.pixel);
		const point = new Point(...ol.proj.toLonLat(coords));

		// check if an icon already exists at the pixel given
		let found = false;
		this.map.forEachFeatureAtPixel(evt.pixel, f => { found = true });

		if(found)
			return;

		this.removeAllPoints();

		let feature = new ol.Feature(new ol.geom.Point(coords));
		feature.setStyle(this.createIconStyle(this.coffeeShopIconPath, undefined));
		feature.setProperties({ name: 'test point', value: 15 });

		this.vectorSource.addFeature(feature);
		this.clicked.next(point)
	}
}
