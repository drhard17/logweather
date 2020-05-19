const puppeteer = require('puppeteer');
const { exec } = require('child_process');
// const fs = require('fs')

// const locData = fs.readFileSync('../csv/locations-eng.txt', 'utf8')
// console.log(locData)


(async () => {

    const name = 'shot.png'
    const table = 'table.searchResults'

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://rp5.ru/Weather_in_Krasnogorsk', {waitUntil: 'networkidle2'});
    await page.$eval('input[name=searchStr]', el => el.value = 'Moscow');
    await page.click('#searchButton')
    await page.waitForSelector(table)
    const href = await page.$eval(table, el => el.querySelector('a').href)
    
    // await page.screenshot({path: name});
    await browser.close();

    console.log(href)
    // exec(`start "" "${name}"`, (error, stdout, stderr) => {})
})();


