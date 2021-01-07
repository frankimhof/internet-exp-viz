import React from 'react';
import * as d3 from 'd3';
import {KexSigDataMean, MeanDataPoint} from './customtypes';

type TickType = {
  value: number,
  offset: number,
}

type Props = {
  title: string,
  xLabel: string,
  yLabel: string,
  data: KexSigDataMean[],
  xAccessor: (d:any)=>number,
  yAccessor: (d:any)=>number,
  yDomain: [number, number]
  stdDevAccessor: (d:MeanDataPoint) =>number,
}

const width=750;
const height=600;
const marginLeft=100;
const marginRight=40;
const marginTop=80;
const marginBottom=80;
const boundedWidth=width-marginLeft-marginRight;
const boundedHeight=height-marginTop-marginBottom;
//const colors = ["#6497b1", "#ececa3", "#b5e550", "#607c3c", "#ffbaba", "#ff5252", "#f00", "#a70000", "#005b96"]
const colors = ["#648FFF", "#785EF0", "#DC267F", "#FE6102", "#FFB000"];
const dashes = ["1 4 2 4 4 4 8 4", "2", "2 6", "3 3 8 3", "8", "4", "2 3 8 3 2 2"];


const LinePlotLog: React.FC<Props> = ({title, data, xLabel, yLabel, xAccessor, yAccessor, yDomain, stdDevAccessor}) =>{
  const xScale:d3.ScaleLogarithmic<number, number> = d3.scaleLog().domain([1, 1000]) //web page sizes go from 1 to 1000 kb
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
        <text x={boundedWidth*0.5+marginLeft} y={0.5*marginTop} fill="white" fontSize={20} textAnchor={"middle"}>{`${title}`}</text>
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          <Labels yLabel={yLabel} xLabel={xLabel}/>
          <Axes xTicks={xTicks as TickType[]} yTicks={yTicks as TickType[]}/>
            {data.map((d:KexSigDataMean, lineIndex:number)=>(
            <CustomLine lineIndex={lineIndex} dataObject={d} color={d.sigName==="ecdsap256" && d.kexName==="prime256v1"? "#ddd":colors[d.index%5]} strokeWidth={2} dashStyle={dashes[d.index%7]} xScale={xScale} yScale={yScale} xAccessor={xAccessor} yAccessor={yAccessor} stdDevAccessor={stdDevAccessor}/>
          ))}
        </g>
      </svg>
    </div>
  )
}

type LineProps = {
  dataObject:KexSigDataMean,
  color: string,
  strokeWidth: number,
  dashStyle: string,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
  xAccessor: (d:any)=>number, 
  yAccessor: (d:any)=>number,
  stdDevAccessor?: (d:any)=>number,
  lineIndex: number,
}  

const CustomLine = ({dataObject, color, strokeWidth, dashStyle, xScale, yScale, lineIndex, xAccessor, yAccessor, stdDevAccessor}:LineProps) => {
  //@ts-ignore
  const lineStringGenerator = d3.line().x(d=>xScale(xAccessor(d))).y(d=>yScale(yAccessor(d)))
  //@ts-ignore
  const lineString = lineStringGenerator(dataObject.data);
  const drawStyle = dataObject.kexName==="prime256v1" && dataObject.sigName==="ecdsap256"? 0 : dataObject.index%6;// always display line of prime256v1 with filled circles

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
    case 4:
      drawPoint = (x, y)=>(
        <>
          <line x1={x-3} x2={x+3} y1={y-3} y2={y+3} stroke={color} strokeWidth={1} fill={"none"}/>
          <line x1={x-3} x2={x+3} y1={y+3} y2={y-3} stroke={color} strokeWidth={1} fill={"none"}/>
          <line x1={x-4} x2={x+4} y1={y} y2={y} stroke={color} strokeWidth={1} fill={"none"}/>
          <line x1={x} x2={x} y1={y-4} y2={y+4} stroke={color} strokeWidth={1} fill={"none"}/>
        </>
      )
      break;
    case 5:
      drawPoint = (x, y)=>(
        <>
          <line x1={x-4} x2={x+4} y1={y-4} y2={y+4} stroke={color} strokeWidth={1} fill={"none"}/>
          <line x1={x-4} x2={x+4} y1={y+4} y2={y-4} stroke={color} strokeWidth={1} fill={"none"}/>
        </>
      )
      break;
    default:
      drawPoint = (x, y)=><circle r={4} fill={color} cx={x} cy={y}></circle>
  }
  
  return(
    <>
      <line transform={`translate(0, ${lineIndex*20})`} y1={-5} y2={-5} x1={20} x2={70} stroke={color} strokeWidth={strokeWidth} strokeDasharray={dashStyle} fill={"none"}/>
      {drawPoint(20, lineIndex*20-5)}
      {drawPoint(70, lineIndex*20-5)}
      <text y={lineIndex*20} x={80} fill={color}>{dataObject.kexName} {dataObject.sigName}</text>
      <path d={lineString} strokeWidth={strokeWidth} strokeDasharray={dashStyle} fill={"none"} stroke={color}/>
      {
        //@ts-ignore
        dataObject.data.map((d:any)=>drawPoint(xScale(xAccessor(d)), yScale(yAccessor(d))))
      }
      {
        dataObject.data.map((d:MeanDataPoint)=>{
        //@ts-ignore
          const stdDev = stdDevAccessor(d);
          //console.log(stdDev)
          const mean = yAccessor(d);
          //console.log(mean)
          return (
          <>
            <line x1={xScale(xAccessor(d))} x2={xScale(xAccessor(d))} y1={yScale(mean+stdDev)} y2={yScale(mean-stdDev)} fill={"none"} stroke={color} strokeWidth={2}/>
            <line x1={xScale(xAccessor(d))-5} x2={xScale(xAccessor(d))+5} y1={yScale(mean-stdDev)} y2={yScale(mean-stdDev)} fill={"none"} stroke={color} strokeWidth={2}/>
            <line x1={xScale(xAccessor(d))-5} x2={xScale(xAccessor(d))+5} y1={yScale(mean+stdDev)} y2={yScale(mean+stdDev)} fill={"none"} stroke={color} strokeWidth={2}/>
          </>
        )})
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
      <text style={{transform:`rotate(-90deg)`}} textAnchor={"middle"} fontSize={20} fill="white">{yLabel}</text>
    </g>
    <g transform={`translate(${boundedWidth*0.5}, ${boundedHeight+marginBottom-10})`}>
      <text textAnchor={"middle"} fill="white" fontSize={20}>{xLabel}</text>
    </g>
  </>
)

export default LinePlotLog;
