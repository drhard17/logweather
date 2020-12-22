const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs')
const fsPromises = require('fs').promises

const locData = fs.readFileSync('../csv/locations-eng.txt', 'utf8')
const locations = locData.split('\r\n')//.slice(0, 10)
console.log(locations)

let result = []

async function getUrl(loc) {
    const name = 'shot.png'
    const table = 'table.searchResults'

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://rp5.ru/Weather_in_Krasnogorsk', {waitUntil: 'networkidle2'});
    
    try {
        // await page.$eval('input[name=searchStr]', el => el.value = loc);
        await page.type('input[name=searchStr]', loc); // Types instantly
        await page.click('#searchButton')
        await page.waitForSelector(table)
        const href = await page.$eval(table, el => el.querySelector('a').href)
        // await page.screenshot({path: name});
        await browser.close();
        console.log(href)
        result.push(href)
        // exec(`start "" "${name}"`, (error, stdout, stderr) => {})
    } catch (error) {
        const err = loc + ': REJECTED'
        console.log(err)
        result.push('null')
    }
}

async function processAll(locations) {
    for (const loc of locations) {
        await getUrl(loc)
    }
    await fsPromises.writeFile('../csv/locations-rp5.txt', result.join('\r\n'))
}

processAll(locations)