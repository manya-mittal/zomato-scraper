const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const xlsx = require('xlsx');

async function scrape() {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  url = 'https://www.zomato.com/jakarta/petogogan-kebayoran-baru-restaurants';

  await page.goto(url, {waitUntil: "load"}); 

  let restaurants = [['Name', 'Phone Number', 'Location']]; // each sub-array represents a row in excel

  // await scrollPageToBottom(page, {
  //   size: 30,
  //   delay: 400
  // })

  // console.log(await page.evaluate('document.body.scrollHeight'));

  await page.keyboard.press('ArrowDown')

  await scrollToBottom(page)
  var cards = await page.$$('div.jumbo-tracker')
  console.log(cards.length);

  var links = []
  var count = 9
  var stoppingPoint = (cards.length/3) +  6
  for (let i = 0; i < stoppingPoint; i++) {
    for (let j = 0; j < 3; j++) {
      try {
        var selector = 'div > div:nth-child('+ count +') > div > div:nth-child('+(j+1)+') > div > div > a'
        // await page.waitForSelector(selector)
        links.push(await page.$eval(selector, (el) => el.href));
      } catch (error) {
        console.log(error);
      }
      
    }
    count++;
  }

  console.log(links);
  console.log(links.length);

  // for (let i = 0; i < cards.length; i++) {
  //   await page.goto(links[i])

  //   const name = await page.$eval('h1', (el) => el.textContent)
  //   const nameSub = name.substring(0, name.length - 1)

  //   const phoneNo = await page.$eval('div > section > section > article > p', (el) => el.textContent)

  //   const location = await page.$eval('div > section > section > article > section > p', (el) => el.textContent)
    
  //   restaurants.push([nameSub, phoneNo, location])
  // }

  //   excelName = 'link_5.xlsx'
  //   var workbook = xlsx.utils.book_new(); // code to save data to an excel sheet
  //   var worksheet = xlsx.utils.aoa_to_sheet(restaurants)
  //   xlsx.utils.book_append_sheet(workbook, worksheet)
  //   xlsx.writeFile(workbook, excelName)
  

  await browser.close()
}
scrape()



async function scrollToBottom(page) {
  let lastHeight = await page.evaluate('document.body.scrollHeight');

  while (true) {
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(2000); // sleep a bit
    let newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === lastHeight) {
        break;
    }
    lastHeight = newHeight;
}
}