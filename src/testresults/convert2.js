const fs = require('fs');
const util = require('util');

//create 1 json file which contains all data from all RTT
//[ {
//    index,
//    rtt_ms,
//    kexName,
//    sigName,
//    data: [{
//      fileSize_kb,
//      median,
//      percent95
//    }, ...]
//  }, ...]
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const unlink = util.promisify(fs.unlink)


fs.readdir('./', async (err, data)=>{
  if(err){
    throw err
  }
  else{
    //we only want the .csv files
    const csvFileNames = data.filter(fileName=>fileName.match(".csv"))
    //collecting all RTT values from fileNames (reduce duplicates by using "Set")
    const rtts = Array.from(new Set(csvFileNames
      .map(fn=>Number(fn.split('__')[0].split('ms')[0].split('_')[1]))))
      .sort((a,b)=>a-b);
    console.log("================================================================================");
    console.log("Reading data from CSV files...") 
    //for every rtt create a json file filled with data that is structured like shown on top

    await Promise.all(rtts.map(async (rtt, rttIndex)=>{
      const fileNamesFilteredByRTT = csvFileNames.filter(fileName=>fileName.match(`RTT_${rtt}ms`))
      const data = await Promise.all(fileNamesFilteredByRTT
        .map(async (fileName, index) => createObjectFromCSVFile(fileName, rtt, index)));
      //getting rid of the unneccessary []
      //      let dataOut = [];
      //      data.map(d=>{
      //        dataOut=[...dataOut, ...d]
      //      })
      const rttAsString = rtt.toString().replace('.', 'p');
      //console.log(`Writing data with RTT=${rtt}ms to ${rttAsString}.json file`);
      //create intermediate <rtt>.json file
      await writeFile(`${rttAsString}.json`, JSON.stringify(data, null, 4))
    }));
    
    //now take all the <rtt>.json files and put their data into one file
    fs.readdir('./', async (err, data)=>{
      if(err){
        throw err
      }
      else{
        console.log("================================================================================");
        console.log("creating data.json File...")
        const jsonFileNames = data.filter(fileName=>fileName.match(".json")).filter(fileName=>fileName!=="data.json")
        let allData = [];
        await Promise.all(jsonFileNames.map(async (fileName) => {
          const dataFromFile = await readFile(fileName, {encoding: "utf8"})
          allData = [...allData, ...JSON.parse(dataFromFile)]
        }))
        allData.sort((a, b)=>a.rtt_ms-b.rtt_ms)
        //delete all intermediate <rtt>.json files
        await Promise.all(jsonFileNames.map(async (fileName) => {
          await unlink(fileName);
        }));
        await writeFile('data.json', JSON.stringify(allData, null, 4));
        console.log("================================================================================");
        console.log("DONE")
      }
    });
  }
})

//now get all .json files and merge them into one data.json


const createObjectFromCSVFile = async (pathString, rtt, index) => {
  const dataFromFile = await readFile(pathString, 'utf8')
  const kexName = pathString.split('__')[2].split('KEX_')[1].split('.')[0];
  const sigName = pathString.split('__')[3].split('SIG_')[1].split('.')[0];
  const reducedData = dataFromFile
      .split(/\r?\n/)// split file by lines
      .slice(0, 4)
      .map(line => line.split(','))// split line by comma
      .map(allEntries => {
        const fileSize_kb = Number(allEntries[0].split('index')[1].split('kb')[0]);
        const values = allEntries.slice(1).map(value=>Number(value));
        return {
//        kexName,
//        sigName,
          fileSize_kb,
          median_ms: median(values)*1000,
          percent95_ms: percentile95(values)*1000,
          mean_ms: mean(values)*1000,
          pop_variance_ms: pop_variance(values, mean(values))*1000
        }
      })
  //return reducedData;
  return {
    index,
    rtt_ms: rtt,
    kexName,
    sigName,
    data: reducedData
  }
}

const median = (arrayOfNumbers) => {
  const ordinalRank = Math.ceil(0.5*arrayOfNumbers.length);
  const sorted = arrayOfNumbers.sort((a, b)=>a-b, 0)
  return sorted[ordinalRank]
};

const percentile95 = (arrayOfNumbers) => {
  const ordinalRank = Math.ceil(0.95*arrayOfNumbers.length);
  const sorted = arrayOfNumbers.sort((a,b)=>a-b);
  return sorted[ordinalRank]
}

const mean = (arrayOfNumbers) => {
  return arrayOfNumbers.reduce((accum, current)=>accum+current, 0)/arrayOfNumbers.length
}

const pop_variance = (arrayOfNumbers, mean) => {
  return arrayOfNumbers.reduce((accum, current)=>accum+Math.pow(current-mean, 2), 0)/arrayOfNumbers.length
}
//createObjectFromCSVFile('./kyber512_5p560ms.csv');
