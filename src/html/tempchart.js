var timeFormat = 'MM/DD/YYYY HH:mm';

function newDate(days) {
    return moment().add(days, 'd').toDate();
}

function newDateString(days) {
    return moment('2020-04-06').add(days, 'd').format(timeFormat);
}

const dataLabels = [0, 1, 2, 3, 4, 5]
//const dataPoints = [0, 1, 4, 9, 16, 25]


const dataPoints = [
    {
        x: newDateString(0),
        y: 4
    }, {
        x: newDateString(1),
        y: 8
    }, {
        x: newDateString(2),
        y: 12

    }, {
        x: newDateString(3),
        y: 15

    }, {
        x: newDateString(4),
        y: 8

    }, {
        x: newDateString(5),
        y: 5

    }
]

/*
const dataPoints = [
    {
        x: 0,
        y: 4
    }, {
        x: 1,
        y: 8
    }, {
        x: 2,
        y: 12

    }, {
        x: 3,
        y: 15

    }, {
        x: 4,
        y: 8

    }, {
        x: 5,
        y: 5

    }
]
*/


const config = {
    type: 'line',
    data: {
//        labels: dataLabels,
        datasets: [{
            label: 'Street t°C',
            data: dataPoints,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fill: false,
            cubicInterpolationMode: 'monotone'

        }]
    },
    options: {
        layout: {        },
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 60,
                padding: 5,
                fontSize: 16
            }
        },
        responsive: true,
        title: {
            display: true,
            text: 'Test forecast chart',
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
                    fontSize: 30
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
                    fontSize: 30
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


const ctx = document.getElementById('myChart');
const myChart = new Chart(ctx, config);
Chart.defaults.global.defaultFontSize = 16;


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

