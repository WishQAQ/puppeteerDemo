const puppeteer = require('puppeteer');

let chromeAddress = require('./chromeAddress')
//
// console.log(ticketData);
// let load = ticketData.load
const load = {
  account: 'tt15204922782skcqn',
  password: 'de289506',
  start: '重庆北',
  end: '重庆西',
  time: '2020-1-28',
  ticketNum: 'D6170',
  // userName: '宋娇',
  userName: '杨国妹',
  userNumber: '310110196211056302',
  userType: '儿童票'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const loginTicket = async (load) => {

}

function searchTicket() {


}
function  buyTick(data) {

}

const scrapeMedium = async () => {
  const browser = await puppeteer.launch({
    headless:false, //是否以”无头”的模式运行
    devtools: false, // 是否打开devtools，headless为false时有效
    slowMo: 70, // puppeteer执行速度
    timeout: 0, // 超时，默认30s，0为没有超时
    executablePath: chromeAddress.address, // 指定可执行chrome路径
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  // console.log("打开12306登录页");
  await page.goto('https://kyfw.12306.cn/otn/resources/login.html');
  await page.setViewport({
    width: 1280,
    height: 2200
  });

  await page.waitForSelector("body > div.login-panel > div.login-box > ul > li.login-hd-account")
  await sleep(1000);

  console.log("选择账号登录");
  await page.click("body > div.login-panel > div.login-box > ul > li.login-hd-account"); //直接操作dom选择器，是不是很方便

  await sleep(1000);
  console.log("输入账号："+load.account);
  await page.type('#J-userName', load.account)
  console.log("输入密码："+load.password);
  await page.type('#J-password', load.password)

  console.log("等待登录");
  await sleep(1000);

  /**
   * @Description: 前往购票页
   * @author Wish
   * @date 2019/12/24
   */

  await page.waitForSelector("#J-chepiao")

  await page.waitForSelector("#js-minHeight")

  await sleep(1000)
  console.log("前往购票页");

  await page.hover("#J-chepiao")

  await sleep(500)

  await page.click("#J-chepiao > div > div:nth-child(1) > ul > li.nav_dan > a")

  await page.waitForSelector('#fromStationText');  // 等待输入框加载完成
  await sleep(1000)

  console.log("选中出发地输入框");
  const start_input = await page.$('#fromStationText')  // 出发地输入框
  await start_input.click()
  await sleep(100)
  console.log("输入出发地：" + load.start);
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
  console.log("输入到达地："+ load.end);
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

  console.log("当前月："+ thisMonth + "，订票月："+ dataMonth + "，订票日："+ dataDay);

  await page.waitForSelector("#train_date")  // 等待日期选择框加载完成
  // await sleep(1000)

  await page.click("#train_date")  // 点击日期选择框

  if(thisMonth === dataMonth){
    await page.click("body > div.cal-wrap > div:nth-child(1) > div.cal-cm > div:nth-child("+dataDay+")")
  }else {
    await page.click("body > div.cal-wrap > div.cal.cal-right > div.cal-cm > div:nth-child("+dataDay+")")
  }

  console.log("开始搜索");
  await page.click("#query_ticket")  // 点击搜索按钮

  /**
   * @Description: 选择车次
   * @author Wish
   * @date 2019/12/24
   */
  await page.waitForSelector("#queryLeftTable > tr")
  await sleep(1000)

  console.log("订票车次："+ load.ticketNum);

  const ticketTable = await page.$$eval('#queryLeftTable > tr',res=>res.map(ele=>ele.innerText)) // 获取路线车次表格

  let ticketIndex = ticketTable.map((res, index) =>{
    if(res.indexOf(load.ticketNum)!== -1){
      return index
    }
  })

  ticketIndex = parseInt(String(ticketIndex).replace(/[^0-9]/ig,""))
  // console.log(page.$$eval('#queryLeftTable > tr:nth-child(' + ticketIndex + ') > td:last-child > a').innerText);
  const ticketInfo = await page.$('#queryLeftTable > tr:nth-child('+ (ticketIndex + 1) +') > td:last-child > a')
  if(ticketIndex < 1){
    await page.click("#queryLeftTable > tr:first-child > td:last-child > a")
  }else {
    await page.click('#queryLeftTable > tr:nth-child('+ (ticketIndex + 1) +') > td:last-child > a')
  }


  await page.waitForSelector("#normal_passenger_id")
  await sleep(1000)

  console.log("获取联系人信息");
  let contactList = await page.$$eval('#normal_passenger_id > li', res=>res.map(ele=>ele.innerText))  // 获取联系人列表数据

  await sleep(2000)
  const forLoop = async _ => {
    console.log('start');
    for (let index = 0; index < contactList.length; index ++) {
      console.log(index + "：" +contactList[index]);
      if(contactList[index].toString() === load.userName){
        if(index < 1){
          await page.click("#normal_passenger_id > li:first-child > label")
        }else {
          await page.click("#normal_passenger_id > li:nth-child("+ (index+1) +") > label")
        }
        console.log('找到啦！' + contactList[index].toString() + " === " + load.userName)
      }
    }
    console.log('End')
  }

  await forLoop()


  await sleep(1000)

  console.log("判断当前页面提交为按钮还是滑块");
  const submitOrderSlide = await page.$("#slide_passcode")
  const submitOrderBtn = await page.$("#submitOrder_id")  // 点击提交订单
  if(submitOrderSlide){
    console.log("等待滑动");
  }else if(submitOrderBtn){
    await page.click("#submitOrder_id")
    console.log("按钮，开始提交");
  }

  await sleep(1000)

  // console.log("判断儿童票确认弹窗");
  // const childDialog = await page.$('#dialog_xsertcj')
  // if(childDialog){
  //   await page.click('#dialog_xsertcj_ok')
  //   console.log("关闭儿童票确认弹窗，重新提交");
  //   if(submitOrderSlide){
  //     console.log("等待滑动");
  //   }else if(submitOrderBtn){
  //     await page.click("#submitOrder_id")
  //     console.log("按钮，开始提交");
  //   }
  // }

  await page.waitForSelector("#content_checkticketinfo_id") // 等待核对信息弹窗
  console.log("等待核对信息弹窗");

  await sleep(500)

  console.log("确认信息，关闭核对弹窗");
  await page.click("#qr_submit_id")  // 确认信息，关闭核对弹窗

  console.log("等待订单信息表格");
  await page.waitForSelector("#table_list")

  const messageDialog = await page.$("#ins_f_close")  // 判断是否有提示框
  if(messageDialog){
    await page.click("#ins_f_close")
  }

  await sleep(2000)

  console.log("确认信息，前往网上支付");

  await page.click("#payButton")

  await sleep(2000)
  console.log("选择支付宝支付");
  await page.click("form > div:nth-last-child(2) > div > img")
  console.log("前往支付宝付款页面");

  console.log("等待付款二维码加载");
  await page.waitForSelector("#J_qrPayArea > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > canvas")

  console.log("等待扫码");
  await page.waitForSelector("#J_qrPayArea > div.qrcode-foot > div.mi-notice-new.mi-notice-new-success.mi-notice-new-titleonly.qrcode-notice.fn-hide > div > div")

  await sleep(500)

  console.log("获取支付宝账号");
  const aliPayId = page.$$eval("#J_tLoginId", input => input.value)
  console.log(aliPayId);


  console.log("等待支付成功");
  await page.waitForSelector()

  console.log("点击支付成功按钮");

  console.log("等待乘客信息数据渲染");
  await page.waitForSelector()



  const result = await page.evaluate(() => {
    let info = document.getElementById("ticketInfo_id").innerText;
    return info
  });

return  result
};

module.exports.scrapeMedium = scrapeMedium
