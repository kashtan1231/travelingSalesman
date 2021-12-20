const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const results = []
let visited = []
let travel = []
let currentST
let prevTarr
let probVistited
let probPrevTarr
let probRoute = []

fs.createReadStream('test_task_data.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => results.push(data)) 
  .on('end', () => {
    let i = 0

    console.log('\x1b[32m', '\n\nФильтрация по времени:\n')
    console.log('\x1b[0m');
    minFirstTimeST(i)
    itarationTime(i)

    console.log('\x1b[34m', '\n\nФильтрация по Стоимости:\n');
    console.log('\x1b[0m');
    minFirstCostST()
    itarationCost(i)
  })
 
const timeComp = (t1, t2) => {
  let [hours1, minutes1, seconds1] = t1.split(':').map(element => +element)
  let [hours2, minutes2, seconds2] = t2.split(':').map(element => +element)

  let sec = seconds2 - seconds1
  if (sec < 0) {
    minutes1 += 1
    sec += 60
  }

  let min = minutes2 - minutes1
  if (min < 0) {
    hours1 += 1
    min += 60
  }

  let hou = hours2 - hours1
  if (hou < 0) {
    hou += 24
  }

  if (prevTarr) {
    let sumHou = 0
    let sumMin = 0
    let sumSec
    let [hoursArr, minutesArr, secondsArr] = prevTarr.split(':').map(element => +element)
    // console.log(hoursArr, minutesArr, secondsArr)
    
    let secArr = seconds1 - secondsArr
    if (secArr < 0) {
      minutesArr += 1
      secArr += 60
    }
    sumSec = sec+secArr
    if(sumSec >= 60 ) {
      sumSec -= 60
      sumMin = 1
    }
    //console.log('secArr: ' + secArr)

    let minArr = minutes1 - minutesArr
    if (minArr < 0) {
      hoursArr += 1
      minArr += 60
    }
    sumMin += min + minArr
    if (sumMin >= 60) {
      sumMin -= 60
      sumHou = 1
    }
    //console.log('minArr: ' + minArr)
    
    let houArr = hours1 - hoursArr
    if (houArr < 0) {
      houArr += 24
    }
    sumHou +=hou + houArr
    //console.log('houArr: ' + houArr)

    //console.log(`time: ${sumHou}, ${sumMin}, ${sumSec}`)
    return [sumHou, sumMin, sumSec]
  }
  
  //console.log ('time: ' + [hou, min, sec])
  return [hou, min, sec]
}

const minFirstTimeST = (i) => {
  let minTime = [+Infinity, +Infinity, +Infinity]
  let number
  
  for(const result of results) {
    let time = timeComp(result.Tdep, result.Tarr)
    
    if (time[0] < minTime[0] || (time[0] == minTime[0] && time[1] < minTime[1])) {
      minTime = time
      number = result.Number
      prevST = result.STdep
      currentST = result.STarr
      probPrevTarr = result.Tarr
      probVistited = [result.STdep, result.STarr]
      probRoute = [result.Number]
      //console.log('minFirstST prevTarr:' + probPrevTarr)
    }
    if (time[0] === minTime[0]) {
      probRoute.push(result.Number)
    }
  }
  travel.push([...new Set (probRoute)])
  travel = [...new Set(travel)]
  prevTarr = probPrevTarr
  visited.push(...probVistited)
  console.log('iteration: ' + (i + 1) + '\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n')
  console.log(minTime, number, visited)
  console.log(travel)
  console.log('\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n')
}

const minFirstCostST = (i = 0) => {
  let number
  let minCost = +Infinity
  let sames = results.filter(station => station.STarr === '1909')
  for (const same of sames) {
    let cost = +same.Cost

    if (cost < minCost) {
      minCost = cost
      number = same.Number
      currentST = same.STarr
      probVistited = [same.STdep, same.STarr]
      probRoute = [same.Number]
    }
    if (cost === minCost) {
      probRoute.push(same.Number)
    }
  }

  travel.push([...new Set (probRoute)])
  travel = [...new Set(travel)]
  visited.push(...probVistited)
  console.log('iteration: ' + (i + 1) + '\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n')
  console.log(minCost, number, visited)
  console.log(travel)
  console.log('\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n')
}

const itarationTime = i => {
  while (true) {
    const props = findMinTime()

    prevTarr = probPrevTarr
    if (probVistited) visited.push(probVistited)
    else {
      travel[travel.length -1].pop()
      console.log('Финальный маршрут: ')
      console.table(travel)
      travel = []
      visited = []
      currentST = undefined
      probVistited = undefined
      probRoute = []
      break
    } 
    console.log('\niteration: ' + (i + 2)+'\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n')
    //console.log(props.sames) // Возможные маршруты с текущей станции    
    console.log(props.minTime, props.number, visited)
    console.log(travel)
    console.log('\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n')

    probVistited = undefined
    probPrevTarr = undefined
    
    i++
  }
}

const itarationCost = (i) => {
  while (true) {
    const props = findMinCost()

    if (probVistited) {
      visited.push(probVistited)    
    }
    else {
      console.log('Финальный маршрут: ')
      console.table( travel)
      travel = []
      visited = []
      currentST = undefined
      probVistited = undefined
      probRoute = []
      break
    } 
    console.log('\niteration: ' + (i + 2)+'\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n')
    //console.log(props.sames) // Возможные маршруты с текущей станции    
    console.log(props.minCost, props.number, visited)
    console.log(travel)
    console.log('\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n')

    probVistited = undefined
    probPrevTarr = undefined
    
    i++
  }
}

const findMinTime = () => {
  let sames = results.filter(station => station.STdep === currentST)
  
        
  let minTime = [+Infinity, +Infinity, +Infinity]
  let number
  for (const same of sames) {
    let time = timeComp(same.Tdep, same.Tarr)

    if ((time[0] < minTime[0] || (time[0] === minTime[0] && time[1] < minTime[1])) &&
    same.STarr !== visited.filter(station => station === same.STarr).toString()) {

      //console.log(same.STarr, time)
      minTime = time
      number = same.Number
      probVistited = same.STarr             
      currentST = same.STarr
      probPrevTarr = same.Tarr
      probRoute = [same.Number]
    }
    if (time[0] === minTime[0]) {
      probRoute.push(same.Number)
    }
  }

  if (probRoute) {
    travel.push([...new Set (probRoute)])
  }
  
  travel = [...new Set(travel)]
  probRoute = undefined
  
  return {
    minTime: minTime,
    number: number,
    sames: sames
  }
}

const findMinCost = () => {
  let sames = results.filter(station => station.STdep === currentST)
  
        
  let minCost = +Infinity
  let number

  for (const same of sames) {
    let cost = +same.Cost

    if (cost < minCost &&
    same.STarr !== visited.filter(station => station === same.STarr).toString()) {
      minCost = cost
      number = same.Number
      probVistited = same.STarr             
      currentST = same.STarr
      probRoute = [same.Number]
    }
    if (cost === minCost) {
      probRoute.push(same.Number)
    }
  }

  if (probRoute) {
    travel.push([...new Set (probRoute)])
  }
  
  travel = [...new Set(travel)]
  probRoute = undefined

  return {
    minCost: minCost,
    number: number,
    sames: sames
  }
}