import React, {useState} from 'react';
import * as d3 from 'd3';

type KexSigData = {
  index: number,
  rtt_ms: number,
  kexName: string,
  sigName: string,
  data: DataPoint[],
}

type DataPoint = {
  fileSize_kb: number,
  median_ms: number,
  percent95_ms: number
}

type TickType = {
  value: number,
  offset: number,
}

type Props = {
  title: string,
  xLabel: string,
  yLabel: string,
  data: KexSigData[],
  xAccessor: (d:DataPoint)=>number,
  yAccessor: (d:DataPoint)=>number,
  yDomain: [number, number]
}

//xDomain: number[],
//yDomain: number[],
const width=700;
const height=600;
const marginLeft=100;
const marginRight=40;
const marginTop=80;
const marginBottom=50;
const boundedWidth=width-marginLeft-marginRight;
const boundedHeight=height-marginTop-marginBottom;
//const colors = ["#6497b1", "#ececa3", "#b5e550", "#607c3c", "#ffbaba", "#ff5252", "#f00", "#a70000", "#005b96"]
const colors = ["#648FFF", "#785EF0", "#DC267F", "#FE6102", "#FFB000"];
const dashes = ["1", "2 6 2", "2 2 4 2 2", "6 6 6 6", "5 1 5 1", "2", "7"];


const LinePlotLog: React.FC<Props> = ({title, data, xLabel, yLabel, xAccessor, yAccessor, yDomain}) =>{
  const xScale:d3.ScaleLogarithmic<number, number> = d3.scaleLog().domain([1, 1000]) //packetLoss goes from 0 to 20
    .range([0, boundedWidth])
  const yScale:d3.ScaleLinear<number, number> = d3.scaleLinear().domain(yDomain)
    .range([boundedHeight, 0])
    .nice()

  const xTicks:TickType[] = xScale.ticks().map(value=>({
      value,
      offset: xScale(value)
    } as TickType
  ))

  const yTicks:TickType[] = yScale.ticks().map((value)=>({
      value,
      offset: yScale(value)
    } as TickType
  ))

  return(
    <div className="plot">
      <svg style={{backgroundColor: "#000", borderRadius: "5px"}} width={width} height={height}>
        <text x={boundedWidth*0.5+marginLeft} y={0.5*marginTop} fill="white" fontSize={20} textAnchor={"middle"}>{`${title}, RTT = ${data[0].rtt_ms} ms`}</text>
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          <Labels yLabel={yLabel} xLabel={xLabel}/>
          <Axes xTicks={xTicks as TickType[]} yTicks={yTicks as TickType[]}/>
          {data.filter((d:KexSigData)=>d.kexName==="prime256v1").map((d:KexSigData, lineIndex:number)=>(
            <CustomLine lineIndex={lineIndex} dataObject={d} color={"#aaa"} strokeWidth={3} dashStyle={"0"} xScale={xScale} yScale={yScale} xAccessor={xAccessor} yAccessor={yAccessor}/>
          ))}//
          {data.filter((d:KexSigData)=>d.kexName!=="prime256v1").map((d:KexSigData, lineIndex:number)=>(
            <CustomLine lineIndex={lineIndex+1} dataObject={d} color={colors[d.index%5]} strokeWidth={2} dashStyle={dashes[d.index%7]} xScale={xScale} yScale={yScale} xAccessor={xAccessor} yAccessor={yAccessor}/>
          ))}
        </g>
      </svg>
    </div>
  )
}

  
type LineProps = {
  dataObject:KexSigData,
  color: string,
  strokeWidth: number,
  dashStyle: string,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
  xAccessor: (d:DataPoint)=>number,
  yAccessor: (d:DataPoint)=>number,
  lineIndex: number,
}  

const CustomLine = ({dataObject, color, strokeWidth, dashStyle, xScale, yScale, lineIndex, xAccessor, yAccessor}:LineProps) => {
  //@ts-ignore
  const line = d3.line().x(d=>xScale(xAccessor(d))).y(d=>yScale(yAccessor(d)))
  //@ts-ignore
  const lineString = line(dataObject.data);
  const drawStyle = dataObject.kexName==="prime256v1"? 0 : dataObject.index%4;// always display line of prime256v1 with filled circles

  let drawPoint:(x:number, y:number)=>JSX.Element;
  switch(drawStyle){
    case 0:
      drawPoint = (x, y)=><circle r={4} fill={color} cx={x} cy={y}></circle>
      break;
    case 1:
      drawPoint = (x, y)=><rect transform={`translate(-3, -3)`} width={6} height={6} strokeWidth={1} fill={color} stroke={color} x={x} y={y}/>
      break;
    case 2:
      drawPoint = (x, y)=><circle r={4} strokeWidth={1} stroke={color} cx={x} cy={y}></circle>
      break;
    case 3:
      drawPoint = (x, y)=><rect transform={`translate(-3, -3)`} width={6} height={6} strokeWidth={1} stroke={color} x={x} y={y}/>
      break;
    default:
      drawPoint = (x, y)=><circle r={4} fill={color} cx={x} cy={y}></circle>
  }
  
  return(
    <>
      <line transform={`translate(0, ${lineIndex*20})`} y1={-5} y2={-5} x1={20} x2={70} stroke={color} strokeWidth={strokeWidth} strokeDasharray={dashStyle} fill={"none"}/>
      {drawPoint(20, lineIndex*20-5)}
      {drawPoint(70, lineIndex*20-5)}
      <text y={lineIndex*20} x={80} fill={color}>{dataObject.kexName}</text>
      <path d={lineString} strokeWidth={strokeWidth} strokeDasharray={dashStyle} fill={"none"} stroke={color}/>
      {
        //@ts-ignore 
        dataObject.data.map((dataPoint, dataPointIndex)=>drawPoint(xScale(xAccessor(dataPoint)), yScale(yAccessor(dataPoint))))
      }
    </>
  )
}

const Axes = ({xTicks, yTicks}:{xTicks:TickType[], yTicks:TickType[]}) => (
  <>
    <g transform={`translate(0, ${boundedHeight})`}>
      <line x2={boundedWidth} stroke="white"/>
      {xTicks.map(({value, offset})=>(
        <g key={value} transform={`translate(${offset}, 0)`}>
          <line y2="6" stroke="white"/> 
          <text key={value} style={{fontSize: "15px", fill: "white", textAnchor:"middle", transform: "translateY(20px)"}}>{[1, 10, 100, 1000].includes(value)? value:""}</text>
        </g>
      ))}
    </g>
    <g>
      <line y2={boundedHeight} stroke="white"/>
      {yTicks.map(({value, offset})=>(
        <g key={value} transform={`translate(0, ${offset})`}>
          <line x2="-6" stroke="white"/> 
          <text key={value} style={{fontSize: "15px", fill: "white", textAnchor:"end", transform: "translate(-10px,2px)"}}>{value}</text>
        </g>
      ))}
    </g>
  </>
);

const Labels = ({xLabel, yLabel}:{xLabel: String, yLabel: String}) => (
  <>
    <g transform={`translate(${-marginLeft+30}, ${boundedHeight*0.5})`}>
      <text style={{transform:`rotate(-90deg)`}} textAnchor={"middle"} fontSize={15} fill="white">{yLabel}</text>
    </g>
    <g transform={`translate(${boundedWidth*0.5}, ${boundedHeight+marginBottom-10})`}>
      <text textAnchor={"middle"} fill="white" fontSize={15}>{xLabel}</text>
    </g>
  </>
)

export default LinePlotLog;
