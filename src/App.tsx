import React, {useState} from 'react';
import './App.css';

import allData from './testresults/data.json';
//import far from './testresults/near.json';
//import worstcase from './testresults/near.json';
import LinePlotLog from './LinePlotLog';
//const internetExpTestresults = [near, medium, far, worstcase];

type KexSigData = {
  index: number,
  rtt_ms: number,
  kexName: string,
  sigName: string,
  data: DataPoint[]
}

type DataPoint = {
  fileSizes_kb: number,
  median_ms: number,
  percent95_ms: number
}

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
  //@ts-ignore
  const foundRTTs = Array.from(new Set(allData.map((d:KexSigData)=>d.rtt_ms).sort((a,b)=>a-b)));
  //@ts-ignore
  const foundKEMs = Array.from(new Set(allData.map((d:KexSigData)=>d.kexName).sort()));
  //@ts-ignore
  //const foundSIGs = Array.from(new Set(allData.map((d:KexSigData)=>d.sigName).sort()));

  const [chosen, setChosen] = useState<String[]>(["prime256v1"])
  const [chosenRTT, setChosenRTT] = useState<Number[]>([foundRTTs[0]])


  const toggle = (k:string) =>{
    if(chosen.includes(k)){
      setChosen(chosen.filter(d=>d!==k))
    }
    else{
      setChosen([...chosen, k])
    }
  }
  const toggleRTT = (k:number) =>{
    if(chosenRTT.includes(k)){
      setChosenRTT(chosenRTT.filter(d=>d!==k))
    }
    else{
      setChosenRTT([...chosenRTT, k])
    }
  }

  return(
    <>
      <h2>RTT</h2>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by RTT 
        //@ts-ignore 
          foundRTTs.map((rtt:number)=>(<div className={chosenRTT.includes(rtt)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggleRTT(parseFloat(e.target.innerHTML))}}>{rtt}ms</div>))
        }
      </div>
      <h2>KEM</h2>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by Kex Name
        //@ts-ignore 
          foundKEMs.map((kemName:string)=>(<div className={chosen.includes(kemName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggle(e.target.innerHTML)}}>{kemName}</div>))
        }
      </div>
      { chosenRTT.length > 0 && chosen.length > 0 ?
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <LinePlotLog data={allData.filter(d=>chosen.includes(d.kexName) && chosenRTT.includes(d.rtt_ms))}
          title="Median"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.median_ms}
          yDomain={[0, 5000]}
        />
        <LinePlotLog data={allData.filter(d=>chosen.includes(d.kexName) && chosenRTT.includes(d.rtt_ms))}
          title="95th percentile"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.percent95_ms}
          yDomain={[0, 5000]}
        />
        </div>
        :
        <div className={"hint"}>To enable visualization, chose both RTT and KEM</div>
      }
    </>
  )
}
export default App;
