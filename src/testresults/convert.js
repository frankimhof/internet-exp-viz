const fs = require('fs');
const util = require('util');

//create 1 json file for every RTT so that each file contains data in the form
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


fs.readdir('./', (err, data)=>{
  if(err){
    throw err
  }
  else{
    //we only want the .csv files
    const csvFileNames = data.filter(fileName=>fileName.match(".csv"))
    //collecting all RTT values from fileNames (reduce duplicates by using "Set")
    const rtts = Array.from(new Set(csvFileNames
      .map(fn=>Number(fn.split('__')[0].split('ms')[0].split('_')[1]))))
      .sort();//shortest RTTs first! used later for naming json files with "near, medium, far, worstcase"
    console.log("FOUND data for following RTTs: "+rtts) 
    //for every rtt create a json file filled with data that is structured like shown on top
    //assuming that the experiment has been run 4 times with different RTT connections (~5ms, ~30ms, ~70ms, ~190ms)
    const finalFileNames = ["near", "medium", "far", "worstcase"];

    rtts.map(async (rtt, rttIndex)=>{
      const fileNamesFilteredByRTT = csvFileNames.filter(fileName=>fileName.match(`RTT_${rtt}ms`))
      const data = await Promise.all(fileNamesFilteredByRTT
        .map(async (fileName, index) => createObjectFromCSVFile(fileName, rtt, index)));
      //getting rid of the unneccessary []
      //      let dataOut = [];
      //      data.map(d=>{
      //        dataOut=[...dataOut, ...d]
      //      })
      console.log(`writing data from experiment with RTT=${rtt}ms to ${finalFileNames[rttIndex]}.json file`);
      fs.writeFileSync(`${finalFileNames[rttIndex]}.json`, JSON.stringify(data, null, 4))
    });
  }
})

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
          percent95_ms: percentile95(values)*1000
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
  const sum = arrayOfNumbers.reduce((p, c)=>p+c, 0)
  return sum/arrayOfNumbers.length;
};

const percentile95 = (arrayOfNumbers) => {
  const ordinalRank = Math.ceil(0.95*arrayOfNumbers.length);
  const sorted = arrayOfNumbers.sort((a,b)=>a-b);
  return sorted[ordinalRank]
}

//createObjectFromCSVFile('./kyber512_5p560ms.csv');
