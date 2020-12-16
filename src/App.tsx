import React, {useState} from 'react';
import './App.css';

import dataJSON from './testresults/data.json';
//import far from './testresults/near.json';
//import worstcase from './testresults/near.json';
import LinePlotLog from './LinePlotLog';
//const internetExpTestresults = [near, medium, far, worstcase];
import {KexSigData} from './customtypes';

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
  //used for buttons
  const foundRTTs = Array.from(new Set(allData.map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)));
  const foundSIGs = Array.from(new Set(allData.map((d:KexSigData)=>d.sigName).sort()));
  const foundKEMs = Array.from(new Set(allData.map((d:KexSigData)=>d.kexName).sort()));

  const [chosenRTT, setChosenRTT] = useState<Number[]>([foundRTTs[0]])
  const [chosenSIG, setChosenSIG] = useState<String[]>(["ecdsap256"])
  const [chosenKEM, setChosenKEM] = useState<String[]>(["prime256v1"])

  const filteredData = allData.filter((d:KexSigData)=>chosenRTT.includes(d.rtt_ms) && chosenSIG.includes(d.sigName) && chosenKEM.includes(d.kexName))
  //used for greying out unavailable combinations
  const availableRTTs = Array.from(new Set(allData.filter((d:KexSigData)=>chosenSIG.includes(d.sigName) && chosenKEM.includes(d.kexName)).map((d:KexSigData)=>d.rtt_ms).sort()));
  const availableSIGs = Array.from(new Set(allData.filter((d:KexSigData)=>chosenRTT.includes(d.rtt_ms) && chosenKEM.includes(d.kexName)).map((d:KexSigData)=>d.sigName).sort()));
  const availableKEMs = Array.from(new Set(allData.filter((d:KexSigData)=> chosenRTT.includes(d.rtt_ms) && chosenSIG.includes(d.sigName)).map((d:KexSigData)=>d.kexName).sort()));

  const toggleRTT = (k:number) =>{
    if(chosenRTT.includes(k)){
      setChosenRTT(chosenRTT.filter(d=>d!==k))
    }
    else{
      setChosenRTT([...chosenRTT, k])
    }
  }

  const toggleKEM = (k:string) =>{
    if(chosenKEM.includes(k)){
      setChosenKEM(chosenKEM.filter(d=>d!==k))
    }
    else{
      setChosenKEM([...chosenKEM, k])
    }
  }

  const toggleSIG = (k:string) =>{
    if(chosenSIG.includes(k)){
      setChosenSIG(chosenSIG.filter(d=>d!==k))
    }
    else{
      setChosenSIG([...chosenSIG, k])
    }
  }

  return(
    <>
      <h2>RTT</h2>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by RTT 
        //@ts-ignore 
          foundRTTs.map((rtt:number)=>(availableRTTs.includes(rtt)? <div className={chosenRTT.includes(rtt)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleRTT(parseFloat(e.target.innerHTML))}}>{rtt}ms</div> : <div className={"button-greyed-out"}>{rtt}</div>))
        }
      </div>
      <h2>SIG</h2>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by Kex Name
        //@ts-ignore 
          foundSIGs.map((sigName:string)=>(availableSIGs.includes(sigName)? <div className={chosenSIG.includes(sigName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleSIG(e.target.innerHTML)}}>{sigName}</div> : <div className={"button-greyed-out"}>{sigName}</div>))
        }
      </div>
      <h2>KEM</h2>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by Kex Name
        //@ts-ignore 
          foundKEMs.map((kemName:string)=>(availableKEMs.includes(kemName)? <div className={chosenKEM.includes(kemName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleKEM(e.target.innerHTML)}}>{kemName}</div> : <div className={"button-greyed-out"}>{kemName}</div>))
        }
      </div>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <LinePlotLog data={filteredData}
          title="Median"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.median_ms}
          yDomain={[0, 4000]}
        />
        <LinePlotLog data={filteredData}
          title="95th percentile"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.percent95_ms}
          yDomain={[0, 4000]}
        />
        </div>
        :
        <div className={"hint"}>To enable visualization, chose both RTT and KEM</div>
    </>
  )
}
export default App;
