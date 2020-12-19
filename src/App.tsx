import React, {useState} from 'react';
import './App.css';

import dataJSON from './testresults/data.json';
//import far from './testresults/near.json';
//import worstcase from './testresults/near.json';
import LinePlotLog from './LinePlotLog';
//const internetExpTestresults = [near, medium, far, worstcase];
import {KexSigData, DataPoint} from './customtypes';

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
  console.log("rerender")
  //used for buttons
  const foundRTTs = showKems?
    Array.from(new Set(allData.filter((d:KexSigData)=>d.kexName!=="prime256v1").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))
  :
    Array.from(new Set(allData.filter((d:KexSigData)=>d.sigName!=="ecdsap256").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)));

  const foundSIGs = showKems? ["ecdsap256"] : Array.from(new Set(allData.filter((d:KexSigData)=>foundRTTs.includes(d.rtt_ms)).map((d:KexSigData)=>d.sigName).sort()));
  const foundKEMs = showKems? Array.from(new Set(allData.map((d:KexSigData)=>d.kexName).sort())) : ["prime256v1"];
  
  const [chosenRTTs, setChosenRTTs] = useState<Number[]>([foundRTTs[0]])
  const [chosenSIGs, setChosenSIGs] = useState<String[]>(["ecdsap256"])
  const [chosenKEMs, setChosenKEMs] = useState<String[]>(["prime256v1"])

  const filteredData = allData.filter((d:KexSigData)=>chosenRTTs.includes(d.rtt_ms) && chosenSIGs.includes(d.sigName) && chosenKEMs.includes(d.kexName))
  //used for greying out unavailable combinations

  const toggleRTTs = (k:number) =>{
    console.log("toggling RTT")
    console.log("Chosen: " + chosenRTTs)
    if(chosenRTTs.includes(k)){
      setChosenRTTs(chosenRTTs.filter(d=>d!==k))
    }
    else{
      setChosenRTTs([...chosenRTTs, k])
    }
  }

  const toggleKEMs = (k:string) =>{
    if(chosenKEMs.includes(k)){
      setChosenKEMs(chosenKEMs.filter(d=>d!==k))
    }
    else{
      setChosenKEMs([...chosenKEMs, k])
    }
  }

  const toggleSIGs = (k:string) =>{
    if(chosenSIGs.includes(k)){
      setChosenSIGs(chosenSIGs.filter(d=>d!==k))
    }
    else{
      setChosenSIGs([...chosenSIGs, k])
    }
  }
  //<div>Show results for different<div className={"button"} onClick={()=>{setShowKems(!showKems); setChosenRTTs([])}}>{showKems? "KEM" : "SIG"}</div></div>
  //

  return(
    <>
    <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{padding: 0, margin: 0, cursor: "pointer"}} onClick={()=>{setShowKems(true); setChosenRTTs([Array.from(new Set(allData.filter((d:KexSigData)=>d.kexName!=="prime256v1").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))[0]])}}><h2 style={{paddingRight: "10px", color: showKems? "lightblue":"#111"}}>KEMs</h2></div>
      <div style={{padding: 0, margin: 0, cursor: "pointer"}} onClick={()=>{setShowKems(false); setChosenRTTs([Array.from(new Set(allData.filter((d:KexSigData)=>d.sigName!=="ecdsap256").map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)))[0]])}}><h2 style={{paddingRight: "10px", color: showKems? "#111":"lightblue"}}>SIGs</h2></div>
    </div>
      <div className={"button-panel"}>
        {showKems &&
        // Create Buttons for filtering data by Kex Name
        //@ts-ignore 
          foundKEMs.map((kemName:string)=>(<div className={chosenKEMs.includes(kemName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleKEMs(e.target.innerHTML)}}>{kemName}</div>))
        }
        {!showKems &&
        // Create Buttons for filtering data by Sig Name
        //@ts-ignore 
          foundSIGs.map((sigName:string)=>(<div className={chosenSIGs.includes(sigName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleSIGs(e.target.innerHTML)}}>{sigName}</div>))
        }
      </div>

      <h2>RTT (ms)</h2>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by RTT 
        //@ts-ignore 
          foundRTTs.map((rtt:number)=>(<div className={chosenRTTs.includes(rtt)? "button-active button" : "button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleRTTs(Number(e.target.innerHTML))}}>{rtt}</div>))
        }
      </div>

      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <LinePlotLog data={filteredData}
          title="Median"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.median_ms}
          meanAccessor={(d)=>d.meanOfMedian_ms}
          stdDevAccessor={(d)=>d.sampleStdDevOfMedian}
          yDomain={[0, 2000]}
          showKems={showKems}
          algList={showKems? foundKEMs:foundSIGs}
        />
        <LinePlotLog data={filteredData}
          title="95th percentile"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.percent95_ms}
          meanAccessor={(d)=>d.meanOfPercent95_ms}
          stdDevAccessor={(d)=>d.sampleStdDevOfPercent95}
          yDomain={[0, 2000]}
          showKems={showKems}
          algList={showKems? foundKEMs:foundSIGs}
        />
        </div>
    </>
  )
}
export default App;
