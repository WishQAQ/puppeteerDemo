# puppeteer 12306 demo

```
// 申明一个puppeteer 实例
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({  // 运行一个 可视化 Chromium 
    headless:false, //是否以”无头”的模式运行
    // devtools: true, // 是否打开devtools，headless为false时有效
    slowMo: 100, // puppeteer执行速度
  });

  const page = await browser.newPage();  // 打开一个新的窗口
  
  await page.goto('https://kyfw.12306.cn/otn/leftTicket/init');  // 前往页面
  
  await page.setViewport({  // 窗口视口大小
    width: 1280,
    height: 2200
  });
  
  await page.waitForSelector('#fromStationText');  // 等待dom出现
 
})();
```
