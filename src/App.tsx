import React, {useState} from 'react';
import './App.css';

import near from './testresults/near.json';
import worstcase from './testresults/worstcase.json';
//import far from './testresults/near.json';
//import worstcase from './testresults/near.json';
import LinePlotLog from './LinePlotLog';
//const internetExpTestresults = [near, medium, far, worstcase];
const internetExpTestresults = [near, worstcase];

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
  const [chosen, setChosen] = useState<String[]>(["prime256v1"])
  const toggle = (k:string) =>{
    if(chosen.includes(k)){
      setChosen(chosen.filter(d=>d!==k))
    }
    else{
      setChosen([...chosen, k])
    }
  }
  return(
    <>
      <div className={"button-panel"}>
        {
        // Create Buttons for filtering data by Kex Name
        //@ts-ignore 
          internetExpTestresults[0].map((kexSigData:KexSigData)=>(<div className={chosen.includes(kexSigData.kexName)? "button-active button" :"button"} onClick={(e:React.MouseEvent)=>{e.preventDefault(); return toggle(e.target.innerHTML)}}>{kexSigData.kexName}</div>))
        }
      </div>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <LinePlotLog data={internetExpTestresults[0].filter(d=>chosen.includes(d.kexName))}
          title="Median"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.median_ms}
          yDomain={[0, 500]}
        />
        <LinePlotLog data={internetExpTestresults[0].filter(d=>chosen.includes(d.kexName))}
          title="95th percentile"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.percent95_ms}
          yDomain={[0, 500]}
        />
      </div>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <LinePlotLog data={internetExpTestresults[1].filter(d=>chosen.includes(d.kexName))}
          title="Median"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.median_ms}
          yDomain={[0, 2500]}
        />
        <LinePlotLog data={internetExpTestresults[1].filter(d=>chosen.includes(d.kexName))}
          title="95th percentile"
          yLabel="Web page retrieval time (ms)"
          xLabel="Web page size (kB, log scale)"
          xAccessor={(d)=>d.fileSize_kb}
          yAccessor={(d)=>d.percent95_ms}
          yDomain={[0, 2500]}
        />
      </div>
    </>
  )
}
export default App;
