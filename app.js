const axios = require('axios');

let appData = require('./ticketData')

const express = require('express')
const app = express()
const scraper = require('./demoJs')
const fs  =require('fs')


const port = 3000

const bodyParser = require('body-parser');//解析,用req.body获取post参数
// 添加json解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
// 允许所有的请求形式
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});
let browserStore = {}

async function getBrowswer(orderId){
  let browser = browserStore[orderId]
  if(browser){
    return browser
  }
  browser = new scraper();
  await browser.init()
  browserStore[orderId] = browser
  return browser
}

let store=JSON.parse(fs.readFileSync('./store.json').toString())

app.get("/tickets",(req,res)=>{
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(store.tickets));
})

app.get('/removeStore')

app.post('/post',(req,res) =>{
  let params = req.body
  // store.tickets.push(params)
    // console.log('当前购票路线：'+ params.time + ' ' + params.start + ' - ' + params.end + ' ' + params.ticketNumber);
    // console.log('当前购票乘客：');
    // params.info.forEach((userInfo,index) =>{
    //   console.log((index+1)+'：'+ userInfo.userName + ' ' + userInfo.userId + ' ' + userInfo.userType);
    // })

    // module.exports.params = params;

    let data = {
      account: params.userAcc,
      password: params.userPas
    }

    // console.log('当前客户端账号：'+ params.userAcc)
    // console.log('当前客户端密码：'+ params.userPas)

    axios.post('https://tohcp.cn/account/login',data)
        .then(val =>{
          if(val.data.code === 0){
            axios.interceptors.request.use(function (config) {    // 这里的config包含每次请求的内容
              config.headers['csrf'] = val.data.result.csrf;
              return config;
            }, function (err) {
              return Promise.reject(err);
            });

            setTimeout(() =>{

              let ticketData = {
                account: params.account,
                password: params.password
              }

              // console.log('当前12306账号：'+ params.account)
              // console.log('当前12306密码：'+ params.password)

              axios.interceptors.request.use(function (config) {    // 这里的config包含每次请求的内容
                config.headers['a'] = params.account;
                config.headers['p'] = params.password;
                config.headers['csrf'] = val.data.result.csrf;
                return config;
              }, function (err) {
                return Promise.reject(err);
              });


              axios.post('https://tohcp.cn/plug/login',ticketData).then(val =>{
                if(val.data.code === 0){
                  console.log('后台登录成功');
                  store.tickets = params;
                  fs.writeFile('./store.json',JSON.stringify(store),()=>{})
                }else {
                  console.log(val.data.msg);
                }
              }).catch(() =>{})
            },800)

          }else {
            console.log(val.data.msg);
          }
        })
        .catch(e => console.log(e))

    res.send(200);

  })


/**
 * @Description: 自动购票
 * @author Wish
 * @date 2020/1/14
*/
app.post('/beginAutomatic',(req,res) =>{
  appData.params = req.body

  // const mediumArticles = new Promise((resolve, reject) => {
    // scraper
    //     .scrapeMedium()
    //     .then(data => {
    //       resolve(data)
    //     })
    //     .catch(err => reject('Medium scrape failed'))
    // getBrowswer(req.query.orderId).goTo(config.loginPage)
  browser = new scraper()
  browser.init(config.loginPage)
  res.end(200)
  // })
  // res.send(200);
})

/**
 * @Description: 自动登录
 * @author Wish
 * @date 2020/1/14
 */
app.post('/beginAutoLogin',(req,res) =>{
  appData.params = req.body

  browser = new scraper()
  browser.toLogin(req.body)
  res.end(200)
  // res.send(200);
})

let browser;


/**
 * @Description: 添加联系人
 * @author Wish
 * @date 2020/1/15
*/
app.post('/beginAutoAdd',(req,res)=>{
  browser = new scraper()
  browser.addUser(req.body)
  res.end(200)
})


/**
 * @Description: 查询选择车次
 * @author Wish
 * @date 2020/1/15
*/
app.post("/beginQueryTrips",(req,res)=>{
  browser = new scraper()
  browser.selectTicket(req.body)
  res.end(200)
})

/**
 * @Description: 选择乘客
 * @author Wish
 * @date 2020/1/15
*/
app.post("/beginSelectPassengers",(req,res)=>{
  browser = new scraper()
  browser.selectUser(req.body)
  res.end(200)
})

/**
 * @Description: 获取支付信息
 * @author Wish
 * @date 2020/1/15
*/
app.get("/beginPayInfo",(req,res)=>{
  browser = new scraper()
  browser.uploadPayInfo()
  res.end(200)
})

/**
 * @Description: 回填数据信息
 * @author Wish
 * @date 2020/1/15
 */
app.post("/beginSuccessInfo",(req,res)=>{
  browser = new scraper()
  browser.uploadSuccessInfo(req.body)
  res.end(200)
})

// app.post('/exit',(req,res) =>{
//   let data = req.body
//   axios.post('https://tohcp.cn/plug/quit',data)
//       .then(res =>{
//         console.log(res);
//       })
//       .catch(e => console.log(e))
// })


app.listen(port, () => console.log(`前往ToHcp购票控制中心 http://127.0.0.1:3000 `))
let config = JSON.parse(fs.readFileSync("./config.json").toString())

