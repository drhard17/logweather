var timeFormat = 'DD/MM/YYYY';

function newDate(days) {
    return moment().add(days, 'd').toDate();
}

function newDateString(days) {
    return moment('2020-04-06').add(days, 'd').format(timeFormat);
}

const dataLabels = [
    newDateString(0),
    newDateString(1),
    newDateString(2),
    newDateString(3),
    newDateString(4),
    newDateString(5),
    newDateString(6),
]

const streetPoints = [4, 8, 12, 15, 8, 5, 6]
const yandexPoints = [8, 11, 10, 14, 8, 3, 6]
const gismeteoPoints = [10, 7, 9, 14, 9, 3 ,5]
const yrnoPoints = [1, 7, 7, 8, 3, 1, 4]
const accuweatherPoints = [8, 14, 10, 14, 10, 5, 6]

const config = {
    type: 'line',
    data: {
        labels: dataLabels,
        datasets: [{
            label: 'Measured',
            data: streetPoints,
            borderColor: 'red',
            backgroundColor: 'red',
            fill: false,
            borderWidth: 4
        }, {
            label: 'Yandex',
            data: yandexPoints,
            borderColor: 'yellow',
            borderWidth: 2
        }, {
            label: 'Gismeteo',
            data: gismeteoPoints,
            borderColor: 'purple',
            borderWidth: 2
        }, {
            label: 'Yr.no',
            data: yrnoPoints,
            borderColor: 'cyan',
            borderWidth: 2
        }, {
            label: 'Accuweather',
            data: accuweatherPoints,
            borderColor: 'orange',
            borderWidth: 2
        }]
    },
    options: {
        layout: {
            padding: {
                right: 25,
                left: 25
            }
        },
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 50,
                padding: 10,
                fontSize: 16
            }
        },
        responsive: true,
        title: {
            display: true,
            text: '3 days forecast accuracy evaluation for Krasnogorsk',
            fontSize: 30
        },
        tooltips: {
            mode: 'index'
        },
        scales: {
            xAxes: [{

                type: 'time',
                distribution: 'series',
                time: {
                    parser: timeFormat,
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM D'
                    }
                },

                display: true,
                color: '#31a11d',
                scaleLabel: {
                    display: true,
                    labelString: 'Day',
                    fontSize: 24
                },
                gridLines: {
                    display: true,
                    color: '#31a11d',
                    zeroLineWidth: 3,
                },
                ticks: {
                    padding: 10
                }
            }],
            yAxes: [{
                display: true,
                
                scaleLabel: {
                    display: true,
                    labelString: 'Temperature',
                    fontSize: 24
                },
                gridLines: {
                    display: true,
                    color: '#31a11d',
                    zeroLineWidth: 3,
                    zeroLineColor: '#31a11d',
                },                
                ticks: {
                    suggestedMin: -5,
                    suggestedMax: 30,
                    padding: 10
                }
            }],
        }
    }
}


const ctx = document.getElementById('myChart')
const myChart = new Chart(ctx, config)

Chart.defaults.global.defaultFontSize = 16
Chart.defaults.global.datasets.fill = false
Chart.defaults.global.datasets.cubicInterpolationMode = 'monotone'
Chart.defaults.global.datasets.backgroundColor = 'rgba(0, 0, 0, 0)'

/*
window.onload = function() {
    const ctx = document.getElementById('myChart').getContext('2d');
    window.myLine = new Chart(ctx, config);
    Chart.defaults.global.defaultFontSize = 20;

    Chart.Legend.prototype.afterFit = function() {
        this.height = this.height + 50;
    };

};
*/    

/*
Chart.Legend.prototype.afterFit = function() {
    this.height = this.height + 10;
};
*/
