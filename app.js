const fs = require('fs')
const { Builder, By, Key, until } = require('selenium-webdriver');

const scrollBottom = require('./commands/scroll-bottom')
const getPageItems = require('./commands/get-page-items')


let coupon1arr = [], coupon2arr = []
const couponBase = 'https://search.jd.com/Search?coupon_batch=44682426'
const activityBase = 'https://search.jd.com/Search?activity_id=207410349'

let driver = new Builder()
  .forBrowser('firefox')
  .build();

let p = getPageData(couponBase, 1).then((list) => coupon1arr = coupon1arr.concat(list))
for (let i = 3; i <= 11; i += 2) {
  p = p.then(() => getPageData(couponBase, i)).then((list) => {
    return coupon1arr = coupon1arr.concat(list)
  }).then(() => console.log(`coupon1arr.length = ${coupon1arr.length}`))
}
for (let j = 1; j <= 49; j += 2) {
  p = p.then(() => getPageData(activityBase, j)).then((list) => {
    return coupon2arr = coupon2arr.concat(list)
  }).then(() => console.log(`coupon2arr.length = ${coupon2arr.length}`))
}
p.then(() => {
  console.log('优惠券商品')
  console.log(coupon1arr)
  console.log('满减商品')
  console.log(coupon2arr)
  return coupon1arr.filter((x) => coupon2arr.indexOf(x) >= 0)
}).then((arr) => {
  console.log(`两个活动重叠的商品如下：`)
  console.log(arr)
  fs.writeFile('result.txt',arr.join("\n"))

})

function getPageData(baseUrl, i) {
  return new Promise((resolve, reject) => {
    driver.get(`${baseUrl}&page=${i}`);
    driver.executeScript(scrollBottom).then(() => {
      console.log(`scrollBottom page ${i}`)
      driver.wait(function () {
        return driver.findElements(By.id('J_scroll_loading'))
          .then((list) => {
            const found = !!list.length
            return !found
          })
      }, 100000);

      driver.executeScript(getPageItems)
        .then((json => JSON.parse(json)))
        .then(function (items) {
          console.log(`${baseUrl}&page=${i} got ${items.length} items`)
          resolve(items)
        })
    })
  })

}
