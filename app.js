const axios = require('axios');

let appData = require('./ticketData')

const express = require('express')
const app = express()
const scraper = require('./demoJs')

const port = 3000

const bodyParser = require('body-parser');//解析,用req.body获取post参数
// 添加json解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// 允许所有的请求形式
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

app.post('/post', function (req, res) {
  let params = req.body
  console.log('当前购票路线：'+ params.time + ' ' + params.start + ' - ' + params.end + ' ' + params.ticketNumber);
  console.log('当前购票乘客：');
  params.info.forEach((userInfo,index) =>{
    console.log((index+1)+'：'+ userInfo.userName + ' ' + userInfo.userId + ' ' + userInfo.userType);
  })

  appData.params = params
  // module.exports.params = params;

  let data = {
    account: params.userAcc,
    password: params.userPas
  }

  console.log('当前客户端账号：'+ params.userAcc)
  console.log('当前客户端密码：'+ params.userPas)

  axios.post('http://oa.huimin.dev.cq1080.com/account/login',data)
      .then(val =>{
        if(val.data.code === 0){
          console.log('登录客户端账号成功');
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

            console.log('当前12306账号：'+ params.account)
            console.log('当前12306密码：'+ params.password)

            axios.post('http://oa.huimin.dev.cq1080.com/plug/login',ticketData).then(val =>{
              if(val.data.code === 0){
                console.log('12306账号后台成功，请勿修改12306登录页面账号');
                const mediumArticles = new Promise((resolve, reject) => {
                  scraper
                      .scrapeMedium()
                      .then(data => {
                        resolve(data)

                        axios.post('http://oa.huimin.dev.cq1080.com/plug/addBuyTicketsInfo/1',data)
                            .then(update =>{

                            })

                      })
                      .catch(err => reject('Medium scrape failed'))
                })
              }else {
                console.log(val.data.msg);
              }
            }).catch(() =>{})
          },800)

        }else {
          console.log(val.data.msg);
        }
      })
      .catch(() =>{

      })
})

// app.get('/', (req, res) => {
//
//   const mediumArticles = new Promise((resolve, reject) => {
//     scraper
//         .scrapeMedium()
//         .then(data => {
//           resolve(data)
//         })
//         .catch(err => reject('Medium scrape failed'))
//   })
//
//


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

