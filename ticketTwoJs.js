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


  await page.waitForSelector('#fromStationText');  // 等待输入框加载完成
  // await sleep(2000)
  console.log("选中出发地输入框");
  const start_input = await page.$('#fromStationText')  // 出发地输入框
  await start_input.click()
  await sleep(100)
  console.log("输入出发地");
  await start_input.type(load.start)  // 输入出发地
  await start_input.type(" ")  // 激活对应城市下拉选择框 添加一个空格
  await page.keyboard.press('Backspace');  // 删除一个空格
  await page.waitForSelector('#panel_cities>div')  // 等待下拉选择框加载
  let cityList = await page.$$eval('#panel_cities>div .ralign', res=>res.map(ele=>ele.innerText))  // 获取激活选择框中的城市列表
  let listIndex = cityList.map((res,index) => {  // 遍历城市列表获取城市下标
    if(res === load.start){
      return index
    }
  })
  let startIndex = parseInt(String(listIndex).replace(/[^0-9]/ig,""))  // 处理下标
  if(startIndex < 1){  // 增加判断，因为找不到nth-child(0)的元素，当下标小于1时，选择第一个元素
    await page.click("#panel_cities>div:first-child")  // 选中对应城市
  }else {
    await page.click("#panel_cities>div:nth-child("+startIndex+")")  // 选中对应城市
  }

  // await sleep(1000)
  console.log("选中到达地输入框");
  const end_input = await page.$('#toStationText')
  await end_input.click()
  await sleep(100)
  console.log("输入到达地");
  await end_input.type(load.end)
  await end_input.type(" ")  // 激活对应城市下拉选择框 添加一个空格
  await page.keyboard.press('Backspace');  // 删除一个空格
  await page.waitForSelector('#panel_cities>div')  // 等待下拉选择框加载
  cityList = await page.$$eval('#panel_cities>div .ralign',res=>res.map(ele=>ele.innerText))  // 获取激活选择框中的城市列表
  listIndex = cityList.map((res,index) => {  // 遍历城市列表获取城市下标
    if(res === load.end){
      return index
    }
  })
  let endIndex = parseInt(String(listIndex).replace(/[^0-9]/ig,""))  // 处理下标
  if(endIndex < 1){
    await page.click("#panel_cities>div:first-child")  // 选中对应城市
  }else {
    await page.click("#panel_cities>div:nth-child("+endIndex+")")  // 选中对应城市
  }


  // 获取当前月份
  let date= new Date;
  let month= date.getMonth()+1;
  month= (month<10 ? "0"+month:month);

  let thisMonth= (month.toString());  // 当前月份
  let dataMonth = load.time.split('-')[1]
  let dataDay = load.time.split('-')[2]

  await page.waitForSelector("#train_date")  // 等待日期选择框加载完成
  // await sleep(1000)
  await page.click("#train_date")  // 点击日期选择框

  if(thisMonth === dataMonth){
    await page.click("body > div.cal-wrap > div:nth-child(1) > div.cal-cm > div:nth-child("+dataDay+")")
  }else {
    await page.click("body > div.cal-wrap > div.cal.cal-right > div.cal-cm > div:nth-child("+dataDay+")")
  }

  await page.click("#query_ticket")  // 点击搜索按钮

  await page.waitForSelector("#queryLeftTable > tr")
  await sleep(1000)

  const ticketTable = await page.$$eval('#queryLeftTable > tr',res=>res.map(ele=>ele.innerText)) // 获取路线车次表格
  console.log(ticketTable);

  let ticketIndex = ticketTable.map((res, index) =>{
    if(res.indexOf(load.ticketNum)!== -1){
      return index
    }
  })

  ticketIndex = parseInt(String(ticketIndex).replace(/[^0-9]/ig,""))
  console.log(ticketIndex);
  // console.log(page.$$eval('#queryLeftTable > tr:nth-child(' + ticketIndex + ') > td:last-child > a').innerText);
  if(ticketIndex < 1){
    await page.click("#queryLeftTable > tr:first-child > td:last-child > a")
  }else {
    await page.click('#queryLeftTable > tr:nth-child('+ ticketIndex / 2 +') > td:last-child > a')
  }

})();
