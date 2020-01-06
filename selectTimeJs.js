const puppeteer = require('puppeteer');

const load = {
  account: 'tt13501443513xehqs',
  password: 'tm973101',
  start: '重庆',
  end: '永川',
  time: '2019-1-21',
  ticketNum: 'G574',
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await puppeteer.launch({
    headless:false, //是否以”无头”的模式运行
    // devtools: true, // 是否打开devtools，headless为false时有效
    slowMo: 100, // puppeteer执行速度
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome Dev\\Application\\chrome.exe', // 指定可执行chrome路径
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  await page.goto('https://kyfw.12306.cn/otn/leftTicket/init');
  await page.setViewport({
    width: 1280,
    height: 2200
  });

  // 获取当前月份
  let date= new Date;
  let month= date.getMonth()+1;
  month= (month<10 ? "0"+month:month);

  let thisMonth= (month.toString());  // 当前月份
  let dataMonth = load.time.split('-')[1]
  let dataDay = load.time.split('-')[2]

  await page.waitForSelector("#train_date")  // 等待日期选择框加载完成
  await sleep(1000)
  await page.click("#train_date")  // 点击日期选择框

  if(thisMonth === dataMonth){
    await page.click("body > div.cal-wrap > div:nth-child(1) > div.cal-cm > div:nth-child("+dataDay+")")
  }else {
    await page.click("body > div.cal-wrap > div.cal.cal-right > div.cal-cm > div:nth-child("+dataDay+")")
  }

})();
