import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as annotationsPlugin from 'chartjs-plugin-annotation';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';
import { PriceResult } from 'src/models/price-result';

@Component({
	selector: 'app-charts',
	templateUrl: './charts.component.html',
	styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

	chartColors = [
		'rgb(255, 99, 132)',
		'rgb(255, 159, 64)',
		'rgb(255, 205, 86)',
		'rgb(45, 192, 45)',
		'rgb(45, 192, 45)',
		'rgb(54, 162, 235)',
		'rgb(24, 42, 75)',
		'rgb(153, 102, 255)',
		'rgb(231,238,235)',
		'rgb(81,88,85)',
		'rgb(20,20,20)',
		'rgb(255,255,255)',
	];

	public barChartOptions = {
		scaleShowVerticalLines: false,
		responsive: true,
		scales: {
			yAxes: [{
				id: 'Coffee',
				type: 'linear',
				ticks: {
					min: 0,
					max: 10,
				},
				scaleLabel: {
					display: true,
					labelString: 'Τιμή',
				},
			},
			// {
			// 	id: 'Water',
			// 	type: 'linear',
			// 	position: 'right',
			// 	display: false,
			// 	ticks: {
			// 		min: 0,
			// 		max: 30,
			// 	},
			// 	// scaleLabel: {
			// 	// 	display: true,
			// 	// 	labelString: 'Water',
			// 	// },
			// },
			]
		},
		tooltips: {
			mode: 'index',
			position: 'nearest',
			intersect: false,
		},
		animation: {
			duration: 0,
		},
		hover: {
			intersect: false,
		}
	};

	public barChartLabels: string[] = [];
	public barChartData = [];
	public barChartDataTemp = [];
	public barChartType = 'line';
	public barChartLegend = true;
	public barChartColors;

	public priceData: PriceResult[];

	@ViewChild(BaseChartDirective) ch: BaseChartDirective;

	dataSeries = [
		{
			// index: 0,
			axisId: 'Coffee',
			colorIdx: 0,
			label: 'Oil Temp.',
			units: 'fahrenheit',
			activeInBypassMode: true,
		},
		{
			// index: 1,
			axisId: 'Water',
			colorIdx: 0,
			label: 'Water Temp.',
			units: 'fahrenheit',
			activeInBypassMode: true,
		},
	];

	constructor() {
		// Chart.pluginService.register(annotationsPlugin);
		this.priceData = JSON.parse(localStorage.getItem('prices'))
		// localStorage.removeItem('prices');

		const distinctCoffees = Array.from(new Set(this.priceData.map((item: PriceResult) => item.productName)))
		const distinctDays = Array.from(new Set(this.priceData.map((item: PriceResult) => item.date)))

		console.log(distinctDays);

		const temp = distinctCoffees.map(pName => {
			return {
				id: pName,
				type: 'linear',
				position: 'right',
				scaleLabel: {
					display: false,
					labelString: 'Τιμή',
				},
				display: false,
				ticks: {
					min: 0,
					max: 30,
				}
			}
		})

		temp.forEach(p => this.barChartOptions.scales.yAxes.push(p))

		this.dataSeries = distinctCoffees.map((pName, ind) => {
			return {
				axisId: pName,
				colorIdx: ind,
				label: pName,
				units: "euro",
				activeInBypassMode: true
			}
		})

		console.log()

		this.refreshDataSeries(this.priceData, distinctCoffees, distinctDays, distinctDays);
	}

	ngOnInit() {
	}

	refreshDataSeries(data: PriceResult[], distinctNames: string[], distinctDates: Date[], xAxis: Date[]) {
		// This is an ugly hack in ng2-charts, line colors will not work without this:
		this.barChartColors = this.dataSeries.map(r => ({
			backgroundColor: this.chartColors[r.colorIdx % this.chartColors.length]//this.chartColors[r.colorName]
		}));

		this.barChartData = this.dataSeries.map(r => ({
			data: [],
			label: r.label,
			yAxisID: r.axisId,
			pointRadius: 3,
			pointBorderWidth: 1,
			pointHoverRadius: 4,
			pointHoverBorderWidth: 2,
			pointHitRadius: 1,
			borderWidth: 1,
			fill: false,
			borderColor: this.chartColors[r.colorIdx], // ...and this...
		}));

		this.barChartDataTemp = this.dataSeries.map(r => ({
			data: [],
			label: r.label,
		}));

		this.barChartLabels = xAxis.map(date => date.toString());

		let series = distinctNames.map(n => { 
			const pricesPerProduct = data.filter(p => p.productName == n)
			const pricesPerDate = distinctDates.map(d => pricesPerProduct.filter(p => p.date == d))

			const mean = pricesPerDate.map(p => { 
				const temp = p.map(x => x.price);
				const sum = (temp.length > 0 && temp.reduce((sum, current) => sum + current)) || 0
				return (temp.length > 0 && sum / temp.length) || 0;
			})
			return mean;
		})
		
		console.log(series);
		series.forEach((s, ind) => this.barChartData[ind].data = s)

	}
}
