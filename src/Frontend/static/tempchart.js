const firstDayInput = document.getElementById('firstDay')
const lastDayInput = document.getElementById('lastDay')
const form = document.getElementById('serviceDepth')
const addChartButton = document.getElementById('addChart')
const locSelect = document.getElementById('citySelect')
const depthSelect = document.getElementById('depth')
const serviceSelect = document.getElementById('serviceSelect')

let chartAdded = false

const maxDepth = {
    ACCUWEATHER: 20,
    GIDROMET: 6,
    GISMETEO: 9,
    RP5: 5,
    WEATHERCOM: 14,
    YANDEX: 9,
    YRNO: 8,
    STREET: 0
}

const tempRequest = {
    firstDay: null,
    lastDay: null,
    charts: [],
    locId: 101
}

locSelect.onchange = function() {
    const locId = parseInt(this.value, 10)
    tempRequest.locId = locId
    const locName = document.querySelector(`option[value="${locId}"]`).innerHTML

    getLastTemp('YANDEX', locId, (err, res) => {
        if (err) return alert(err)    
        const temp = res.temp
        document.querySelector('#sTemp').innerHTML = temp
        document.querySelector('#sCity').innerHTML = locName
        removeData(myChart)
    })
}

firstDayInput.oninput = function() {
    if (chartAdded) {
        updChartDates()
    }
}

lastDayInput.oninput = firstDayInput.oninput

addChartButton.onclick = function() {
    const service = serviceSelect.value
    const depth = parseInt(depthSelect.value, 10)
    tempRequest.charts.push({serviceName: service, depth: depth})    
    chartAdded = true
    updChartDates()
}

serviceSelect.onchange = function() {
    const serviceMaxDepth = maxDepth[serviceSelect.value]
    const depthElements = formDepthOptions(serviceMaxDepth)
    depthSelect.innerHTML = depthElements
}

function formDepthOptions(maxDepth) {
    const result = []
    for (let i = 0; i<=maxDepth; i++) {
        result.push(`<option value="${i}">${i}</option>`)
    }
    return result.join('\r\n')
}

function getChartData(tempRequest, cb) {
    let xhr = new XMLHttpRequest()
    xhr.open('POST', '/getchartdata')
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json'

    const body = JSON.stringify(tempRequest)

    xhr.send(body)
    xhr.onload = function() {
        cb(null, xhr.response)
    }

    xhr.onerror = function() {
        cb('XHR error')
    }
}

function getLastTemp(service, locId, cb) {
    const xhr = new XMLHttpRequest()

    xhr.open('POST', '/getlasttemp')
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json'

    const reqBody = {service, locId}

    const body = JSON.stringify(reqBody)

    xhr.send(body)
    xhr.onload = function() {
        cb(null, xhr.response)
    }

    xhr.onerror = function() {
        cb('XHR error')
    }
}

function updChartDates() {
    const firstDay = firstDayInput.value || new Date('2020-03-30')
    const lastDay = lastDayInput.value || new Date

    firstDayInput.value = moment(firstDay).format('YYYY-MM-DD')
    lastDayInput.value = moment(lastDay).format('YYYY-MM-DD')

    tempRequest.firstDay = firstDay
    tempRequest.lastDay = lastDay

    if (chartAdded) {
        updateChart()
    }
}

function updateChart() {
    getChartData(tempRequest, (err, res) => {
        if (err) return alert(err)
        renderChart(myChart, res)
    })
}

function renderChart(myChart, chartData) {
    config.data.labels = chartData.labels.map(date => moment(date).format(timeFormat))
    config.data.datasets = chartData.points.map((chart) => {
        return {
            label: `${chart.serviceName} - ${chart.depth}`,
            data: chart.temps,
            borderColor: chartColor[chart.serviceName],
            borderWidth: 2
        }
    })
    myChart.update()
}

function removeData(myChart) {
    config.data.datasets = []
    tempRequest.charts = []
    myChart.update();
}

const chartColor = {
    STREET: 'red',
    YANDEX: 'yellow',
    GISMETEO: 'purple',
    YRNO: 'cyan',
    ACCUWEATHER: 'orange',
    RP5: 'blue',
    WEATHERCOM: 'brown',
    GIDROMET: 'gray'
}

const timeFormat = 'DD/MM/YYYY';
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
const rp5Points = [NaN, NaN, NaN, NaN, 9, 4, 5]
const weathercomPoints = [8, 11, 11, 15, 9, 5, 7]

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
        }, {
            label: 'RP5',
            data: rp5Points,
            borderColor: 'blue',
            borderWidth: 2
        }, {
            label: 'weather.com',
            data: weathercomPoints,
            borderColor: 'brown',
            borderWidth: 2
        }]
    },
    options: {
        layout: {
            padding: {
                top: 10,
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
            display: false,
            text: 'City: Opaliha',
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
Chart.defaults.global.defaultFontFamily = 'Mina'
Chart.defaults.global.datasets.fill = false
Chart.defaults.global.datasets.cubicInterpolationMode = 'monotone'
Chart.defaults.global.datasets.backgroundColor = 'rgba(0, 0, 0, 0)'
