import React, {useState} from 'react';
import './App.css';

import dataJSON from './testresults/data.json';
//import far from './testresults/near.json';
//import worstcase from './testresults/near.json';
import LinePlotLog from './LinePlotLog';
//const internetExpTestresults = [near, medium, far, worstcase];
import {KexSigData, KexSigDataMean, MeanDataPoint} from './customtypes';

const allData:KexSigData[] = dataJSON.map((d:any)=>d as KexSigData);

function App() {
  return (
    <div className="App">
      <div className="App-body">
        <h1>Internet Experiment Testresults</h1>
        <InternetExperimentPlots/>
      </div>
  </div>
  );
}

const InternetExperimentPlots = () =>{
  const [showKems, setShowKems] = useState(true);
  const [showStdDeviation, setShowStdDeviation] = useState(false);
  const [showInfo, setShowInfo] = useState(false);//info for displaying limit of four lines per graph

  const availableRTTs = showKems?
    Array.from(new Set(allData.filter((d:KexSigData)=>d.kexName!=="prime256v1").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))
  :
    Array.from(new Set(allData.filter((d:KexSigData)=>d.sigName!=="ecdsap256").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)));

  const availableSIGs = showKems? ["ecdsap256"] : Array.from(new Set(allData.filter((d:KexSigData)=>availableRTTs.includes(d.rtt_ms)).map((d:KexSigData)=>d.sigName).sort()));
  const availableKEMs = showKems? Array.from(new Set(allData.map((d:KexSigData)=>d.kexName).sort())) : ["prime256v1"];
   
  const [chosenRTTs, setChosenRTTs] = useState<Number[]>([availableRTTs[0]])
  const [chosenRTTs2, setChosenRTTs2] = useState<Number[]>([availableRTTs[0]])
  const [chosenSIGs, setChosenSIGs] = useState<string[]>(["ecdsap256"])
  const [chosenKEMs, setChosenKEMs] = useState<string[]>(["prime256v1"])

  const toggleRTTs = (k:number) =>{
    if(chosenRTTs.includes(k)){
        setChosenRTTs(chosenRTTs.filter(d=>d!==k))
    }
    else{
      setChosenRTTs([...chosenRTTs, k])
    }
  }

  const toggleRTTs2 = (k:number) =>{
    if(chosenRTTs2.includes(k)){
        setChosenRTTs2(chosenRTTs2.filter(d=>d!==k))
    }
    else{
      setChosenRTTs2([...chosenRTTs2, k])
    }
  }
  const toggleKEMs = (k:string) =>{
    if(chosenKEMs.includes(k)){
        setChosenKEMs(chosenKEMs.filter(d=>d!==k))
    }
    else{
      if(chosenKEMs.length !== 4) setChosenKEMs([...chosenKEMs, k])
      else{
        setShowInfo(true);
        setTimeout(()=>setShowInfo(false), 1500);
      }
    }
  }

  const toggleSIGs = (k:string) =>{
    if(chosenSIGs.includes(k)){
        setChosenSIGs(chosenSIGs.filter(d=>d!==k))
    }
    else{
      if(chosenSIGs.length !== 4) setChosenSIGs([...chosenSIGs, k])
      else{
        setShowInfo(true);
        setTimeout(()=>setShowInfo(false), 1500);
      }
    }
  }

  const getIndex = (n:string) => (showKems? availableKEMs : availableSIGs).indexOf(n);
  //if more than one dataset is selected, create one DataObject holding mean and sample standard deviation of all median and percent95 values
  const createMeanAndDeviationData = (chosenRTTArray:Number[]):KexSigDataMean[] =>{

  return chosenRTTArray.length===0? []:(showKems? chosenKEMs : chosenSIGs) 
    .map(name=>{
      const selectedData = allData.filter((d:KexSigData)=> chosenRTTArray.includes(d.rtt_ms) && chosenSIGs.includes(d.sigName) && chosenKEMs.includes(d.kexName))// this was here before  && 
      console.log(selectedData)
      const algDatasets = selectedData.filter((d:KexSigData)=>showKems? d.kexName===name:d.sigName===name);
      const {kexName, sigName} = algDatasets[0];
      const divisor = algDatasets.length>1? algDatasets.length-1 : 1;//prevent division by zero
      const res = {index: getIndex(name), kexName, sigName, data: []} as KexSigDataMean;
      res.data = algDatasets[0].data.map((dp, i)=>{
        const meanOfMedian_ms = algDatasets.reduce((accum, curr)=>accum+curr.data[i].median_ms, 0)/algDatasets.length;
        const meanOfPercent95_ms = algDatasets.reduce((accum, curr)=>accum+curr.data[i].percent95_ms, 0)/algDatasets.length;
        return  {
            fileSize_kb: dp.fileSize_kb, 
            meanOfMedian_ms,
            meanOfPercent95_ms,
            sampleStdDevOfMedian: Math.sqrt(algDatasets.reduce((accum, curr)=>accum+Math.pow(curr.data[i].median_ms-meanOfMedian_ms, 2), 0)/divisor),
            sampleStdDevOfPercent95: Math.sqrt(algDatasets.reduce((accum, curr)=>accum+Math.pow(curr.data[i].percent95_ms-meanOfPercent95_ms, 2),0)/divisor)
          } as MeanDataPoint
      })
      return res;
    })
  };
  const meanAndVarianceData = createMeanAndDeviationData(chosenRTTs);
  const meanAndVarianceData2 = createMeanAndDeviationData(chosenRTTs2);
  console.log(meanAndVarianceData2)
  const displayData:KexSigDataMean[] = [...meanAndVarianceData, ...meanAndVarianceData2];

  return(
    <>
    <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{padding: 0, margin: 0, cursor: "pointer"}} onClick={()=>{
        setChosenRTTs([Array.from(new Set(allData.filter((d:KexSigData)=>d.kexName!=="prime256v1").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))[0]])
        setChosenRTTs2([Array.from(new Set(allData.filter((d:KexSigData)=>d.kexName!=="prime256v1").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))[0]])
        setShowKems(true);
        setChosenKEMs(["prime256v1"])
        setChosenSIGs(["ecdsap256"])
      }}>
        <h2 style={{paddingRight: "10px", color: showKems? "lightblue":"#111"}}>KEMs</h2>
        </div>
        <div style={{padding: 0, margin: 0, cursor: "pointer"}} onClick={()=>{
          setChosenRTTs([Array.from(new Set(allData.filter((d:KexSigData)=>d.sigName!=="ecdsap256").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))[0]])
          setChosenRTTs2([Array.from(new Set(allData.filter((d:KexSigData)=>d.sigName!=="ecdsap256").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))[0]])
          setShowKems(false); 
          setChosenSIGs(["ecdsap256"])
          setChosenKEMs(["prime256v1"])
        }}>
          <h2 style={{paddingRight: "10px", color: showKems? "#111":"lightblue"}}>SIGs</h2></div>
    </div>
      <div className={"button-panel"}>
        {showKems &&
        // Create Buttons for filtering data by Kex Name
        //@ts-ignore 
          availableKEMs.map((kemName:string)=>(<div className={chosenKEMs.includes(kemName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleKEMs(e.target.innerHTML)}}>{kemName}</div>))
        }
        {!showKems &&
        // Create Buttons for filtering data by Sig Name
        //@ts-ignore 
          availableSIGs.map((sigName:string)=>(<div className={chosenSIGs.includes(sigName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleSIGs(e.target.innerHTML)}}>{sigName}</div>))
        }
      </div>
      <h3>Create lines</h3>
      <div>To create a line, select a dataset. Multiple selection will result in a line that displays mean and standard deviation of selected datasets.</div>
      <div className={"button-panel"}>
        <h3 style={{display: "flex", alignItems: "center", padding: 0, margin: 0}}>Line 1</h3>
        {
        // Create Buttons for filtering data by RTT 
        //@ts-ignore 
          availableRTTs.map((rtt:number)=>(<div className={chosenRTTs.includes(rtt)? "button-active button" : "button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleRTTs(Number(e.target.innerHTML))}}>{rtt}</div>))
        }
      </div>
      <div className={"button-panel"}>
        <h3 style={{display: "flex", alignItems: "center", padding: 0, margin: 0}}>Line 2</h3>
        {
        // Create Buttons for filtering data by RTT 
        //@ts-ignore 
          availableRTTs.map((rtt:number)=>(<div className={chosenRTTs2.includes(rtt)? "button-active button" : "button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleRTTs2(Number(e.target.innerHTML))}}>{rtt}</div>))
        }
      </div>
      {showInfo && <h3 style={{color: "red"}}>Limited to 4 lines per graph</h3>}
      <div style={{width: "200px"}} className={showStdDeviation? "button-active button" :"button"} onClick={()=>setShowStdDeviation(!showStdDeviation)}>Show Standard Deviation</div>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "center", flexWrap: "wrap"}}>
        <LinePlotLog data={displayData}
          title={`${showKems? "Key Exchange": "Signatures"} - Median`}
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.meanOfMedian_ms}
          stdDevAccessor={(d)=>d.sampleStdDevOfMedian}
          yDomain={[0, getMax(displayData, (d)=>d.meanOfMedian_ms, (d)=>d.sampleStdDevOfMedian)]}
          showStdDeviation={showStdDeviation}
        />
        <LinePlotLog data={displayData}
          title={`${showKems? "Key Exchange": "Signatures"} - 95th Percentile`}
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.meanOfPercent95_ms}
          stdDevAccessor={(d)=>d.sampleStdDevOfPercent95}
          yDomain={[0, getMax(displayData, (d)=>d.meanOfPercent95_ms, (d)=>0)]}
          showStdDeviation={showStdDeviation}
        />
        </div>
    </>
  )
}
const getMax = (dArr:KexSigDataMean[], yAccessor:(d:any)=>number, stdDevAccessor:(d:any)=>number) => {
  const allMaxValues = dArr.map((d)=>(
    d.data.reduce((biggest, curr)=>{
      const currValue = yAccessor(curr)+stdDevAccessor(curr);
      return currValue>biggest? currValue:biggest;
    }, 0)
  ))
  return allMaxValues.sort((a,b)=>a-b).slice(-1)[0]; 
}
export default App;
