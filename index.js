const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')({ sigint: true });
const xlsx = require('xlsx');

async function scrape() {
  

  console.log('This program requires a URL from Zomato. For exmaple: https://www.zomato.com/jakarta/thamrin-restaurants');
  var url = prompt('Please enter a Zomato URL: ');

  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.goto(url, {waitUntil: "load"}); 

  let restaurants = [['Name', 'Phone Number', 'Location']]; // each sub-array represents a row in excel

  var cards = []
  var links =[]

  var count = 8
  if(await page.$('div > div:nth-child('+ count +') > div > div:nth-child(1) > div > div > a') == null){
    count = 9
  }

  
  let lastHeight = await page.evaluate('document.body.scrollHeight');

  while (true){
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press('ArrowDown') // scrolls down by pressing down arrow key
    }
    await page.waitForTimeout(2000)

    try {
      cards = await page.$$('div.jumbo-tracker')
    } catch (error) {
      console.log(error);
    }

    let newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === lastHeight) { // height didn't increase which means that nothing new was loaded
        break;
    }
    lastHeight = newHeight;

  }

  
  console.log(cards.length);

  var stoppingPoint = (cards.length/3) +  count
  var startingPoint = count
  console.log(stoppingPoint);
  try {
    for (let i = startingPoint; i < stoppingPoint; i++) {
      for (let j = 0; j < 3; j++) {
        try {
          var selector = 'div > div:nth-child('+ count +') > div > div:nth-child('+(j+1)+') > div > div > a'
          links.push(await page.$eval(selector, (el) => el.href));
        } catch (error) {
           console.log(error);
        }
        
      }
      count++;
    }
    
  } catch (error) {
   console.log('links so far:' + links); 
   console.log('links fo far length:' + links.length);
  }
  

  console.log(links);
  console.log(links.length);


  for (let i = 0; i < links.length; i++) { //goes to each link and gets the data
    await page.goto(links[i], {waitUntil: "load"})

    const name = await page.$eval('h1', (el) => el.textContent)
    const nameSub = name.substring(0, name.length - 1)

    const phoneNo = await page.$eval('div > section > section > article > p', (el) => el.textContent)

    const location = await page.$eval('div > section > section > article > section > p', (el) => el.textContent)
    
    restaurants.push([nameSub, phoneNo, location])
  }
  
  excelName = 'test.xlsx' // saves into an excel file
  var workbook = xlsx.utils.book_new(); // code to save data to an excel sheet
  var worksheet = xlsx.utils.aoa_to_sheet(restaurants)
  xlsx.utils.book_append_sheet(workbook, worksheet)
  xlsx.writeFile(workbook, excelName)


  await browser.close() // closes the browser window
}
scrape()

