import React, {useState} from 'react';
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
  showStdDeviation: boolean,
}

const width=650;
const height=550;
const marginLeft=100;
const marginRight=80;
const marginTop=80;
const marginBottom=80;
const boundedWidth=width-marginLeft-marginRight;
const boundedHeight=height-marginTop-marginBottom;
//const colors = ["#6497b1", "#ececa3", "#b5e550", "#607c3c", "#ffbaba", "#ff5252", "#f00", "#a70000", "#005b96"]
//const colors = ["#648FFF", "#785EF0", "#DC267F", "#FE6102", "#FFB000"];
//const colors = ["#c51b7d", "#4d9221", "#2166ac", "#8c510a"]
const colors = ["black", "red", "blue", "green"];
const dashes = ["0", "2", "12 4 2 4", "7"];
const strokeWidths = [1, 2.5, 1.5, 1.5];
type PointStyleType = "rect" | "cross" | "circle" | "line"
const pointStyles:PointStyleType[] = ["line", "cross", "rect", "circle"];


const LinePlotLog: React.FC<Props> = ({title, data, xLabel, yLabel, xAccessor, yAccessor, yDomain, stdDevAccessor, showStdDeviation}) =>{
  const chosenNumberOfAlgs = new Set(data.map(e=>e.kexName+e.sigName)).size;
  const [mouseXY, setMouseXY] = useState({x:0, y:0});
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e:React.MouseEvent<SVGGElement, MouseEvent>) => {
    //@ts-ignore
    setMouseXY({x: (e as MouseEvent).nativeEvent.layerX-marginLeft, y: (e as MouseEvent).nativeEvent.layerY-marginTop});
    //setMouseXY(mouseXY=> ({...mouseXY, x: e.nativeEvent.layerX-marginLeft+5, y: e.nativeEvent.layerY-marginTop-15, yValue: yScale.invert(e.nativeEvent.layerY-marginTop)}))
  }
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
      <svg style={{backgroundColor: "white", borderRadius: "5px"}} width={width} height={height}>
        <text transform={`translate(${width*0.5}, ${marginTop*0.5})`} fill="black" fontSize={30} fontWeight="bold" textAnchor="middle">
          {`${title}`}
        </text>
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {isHovered &&
            <g transform={`translate(${mouseXY.x}, ${mouseXY.y})`}>
              <line x1={0} x2={0} y1={-30} y2={-5} style={{stroke:"black",strokeWidth:2}}/>
              <text fill="black" x={-10} y={-15} textAnchor="end">{yScale.invert(mouseXY.y).toFixed(1)}ms</text>
            </g>
          }
          <Labels yLabel={yLabel} xLabel={xLabel}/>
          <Axes xTicks={xTicks as TickType[]} yTicks={yTicks as TickType[]}/>
          {data.map((d:KexSigDataMean, lineIndex:number)=>{
            const styleModulo = lineIndex<chosenNumberOfAlgs? lineIndex : lineIndex-chosenNumberOfAlgs;
            return (
            <CustomLine dataObject={d} 
              color={colors[styleModulo]} 
              dashStyle={dashes[styleModulo]}
              pointStyle={pointStyles[styleModulo]}
              strokeWidth={strokeWidths[styleModulo]}
              xScale={xScale} yScale={yScale} xAccessor={xAccessor} yAccessor={yAccessor} stdDevAccessor={stdDevAccessor}
              lineIndex={styleModulo}
              showStdDeviation={showStdDeviation}
            />
          )})}
        </g>
        <rect transform={`translate(${marginLeft-10}, ${marginBottom-10})`} width={boundedWidth+20} height={boundedHeight+20} fill="transparent"
          onMouseEnter={()=>setIsHovered(true)} 
          onMouseLeave={()=>setIsHovered(false)}
          onMouseMove={handleMouseMove}
        />
      </svg>
    </div>
  )
}

interface LineProps {
  dataObject:KexSigDataMean,
  color: string,
  strokeWidth: number,
  dashStyle: string,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  xAccessor: (d:any)=>number, 
  yAccessor: (d:any)=>number,
  stdDevAccessor?: (d:any)=>number,
  pointStyle: PointStyleType,
  lineIndex: number,
  showStdDeviation: boolean,
}  

const CustomLine = ({dataObject, lineIndex, color, strokeWidth, dashStyle, xScale, yScale, xAccessor, yAccessor, stdDevAccessor, pointStyle, showStdDeviation}:LineProps) => {
  //@ts-ignore
  const lineStringGenerator = d3.line().x(d=>xScale(xAccessor(d))).y(d=>yScale(yAccessor(d)))
  //@ts-ignore
  const lineString = lineStringGenerator(dataObject.data);

  let drawPoint:(x:number, y:number)=>JSX.Element;
  switch(pointStyle){
    case "rect":
      drawPoint = (x, y)=>(
        <>
          <line x1={x-4} y1={y} x2={x} y2={y+4} strokeWidth={1.5} stroke={color} fill="transparent"/>
          <line x1={x} y1={y+4} x2={x+4} y2={y} strokeWidth={1.5} stroke={color} fill="transparent"/>
          <line x1={x+4} y1={y} x2={x} y2={y-4} strokeWidth={1.5} stroke={color} fill="transparent"/>
          <line x1={x} y1={y-4} x2={x-4} y2={y} strokeWidth={1.5} stroke={color} fill="transparent"/>
        </>
      )
      break;
    case "cross":
      drawPoint = (x, y)=>(
        <>
          <line x1={x-4} x2={x+4} y1={y-4} y2={y+4} stroke={color} strokeWidth={2} fill={"transparent"}/>
          <line x1={x-4} x2={x+4} y1={y+4} y2={y-4} stroke={color} strokeWidth={2} fill={"transparent"}/>
        </>
      )
      break;
    case "circle":
      drawPoint = (x, y)=><circle r={4} strokeWidth={1.5} stroke={color} cx={x} cy={y} fill="transparent"></circle>
      break;
    case "line":
      drawPoint = (x, y)=><line x1={x} x2={x} y1={y+5} y2={y-5} stroke={color} strokeWidth={1.5}/>
      break;
    default:
      drawPoint = (x, y)=><circle r={4} fill={color} cx={x} cy={y}></circle>
  }
  const textHeight = 18; 

  return(
    <>
      {showStdDeviation &&
        dataObject.data.map((d:MeanDataPoint)=>{
          //@ts-ignore
          const stdDev = stdDevAccessor(d);
          //console.log(stdDev)
          const mean = yAccessor(d);
          //console.log(mean)
          const x = xScale(xAccessor(d))
          return (
          <>
            <line x1={x} x2={x} y1={yScale(mean+stdDev)} y2={yScale(mean-stdDev)} fill={"none"} stroke={color} strokeWidth={1}/>
            <line x1={x-5} x2={x+5} y1={yScale(mean-stdDev)} y2={yScale(mean-stdDev)} fill={"none"} stroke={color} strokeWidth={1}/>
            <line x1={x-5} x2={x+5} y1={yScale(mean+stdDev)} y2={yScale(mean+stdDev)} fill={"none"} stroke={color} strokeWidth={1}/>
          </>
        )})
      }
      <line transform={`translate(0, ${lineIndex*textHeight})`} y1={-5} y2={-5} x1={20} x2={70} stroke={color} strokeWidth={strokeWidth} strokeDasharray={dashStyle} fill={"none"}/>
      {drawPoint(20, lineIndex*textHeight-5)}
      {drawPoint(70, lineIndex*textHeight-5)}
      <text y={lineIndex*textHeight} x={80} fontSize={textHeight} fill={color}>{dataObject.kexName} {dataObject.sigName}</text>
      <path d={lineString} strokeWidth={strokeWidth} strokeDasharray={dashStyle} fill={"none"} stroke={color}/>
      {
        //@ts-ignore
        dataObject.data.map((d:any)=>drawPoint(xScale(xAccessor(d)), yScale(yAccessor(d))))
      }
    </>
  )
}

const Axes = ({xTicks, yTicks}:{xTicks:TickType[], yTicks:TickType[]}) => {
  const axesColor="black";
  const tickLabelFontSize = "15px";
  return (
  <>
    <g transform={`translate(0, ${boundedHeight})`}>
      <line x2={boundedWidth} stroke={axesColor}/>
      {xTicks.map(({value, offset})=>(
        <g key={value} transform={`translate(${offset}, 0)`}>
          <line y2="6" stroke={axesColor}/> 
          <text key={value} style={{fontSize: tickLabelFontSize, fill: `${axesColor}`, textAnchor:"middle", transform: "translateY(20px)"}}>{[1, 10, 100, 1000].includes(value)? value:""}</text>
        </g>
      ))}
    </g>
    <g>
      <line y2={boundedHeight} stroke={axesColor}/>
      {yTicks.map(({value, offset})=>(
        <g key={value} transform={`translate(0, ${offset})`}>
          <line x2="-6" stroke={axesColor}/> 
          <text key={value} style={{fontSize: tickLabelFontSize, fill: `${axesColor}`, textAnchor:"end", transform: "translate(-10px,2px)"}}>{value}</text>
        </g>
      ))}
    </g>
  </>
)};

const Labels = ({xLabel, yLabel}:{xLabel: String, yLabel: String}) => {
  const labelColor="black";

  return (
  <>
    <g style={{transform:`rotate(-90deg)`}}>
      <text transform={`translate(${-boundedHeight*0.5}, ${-marginLeft*0.6})`} textAnchor={"middle"} fontSize={20} fill={labelColor}>{yLabel}</text>
    </g>
    <g transform={`translate(${boundedWidth*0.5}, ${boundedHeight+marginTop*0.6})`}>
      <text textAnchor={"middle"} fill={labelColor} fontSize={20}>{xLabel}</text>
    </g>
  </>
)}

// data point as a star
//    case 3:
//      drawPoint = (x, y)=>(
//        <>
//          <line x1={x-3} x2={x+3} y1={y-3} y2={y+3} stroke={color} strokeWidth={1} fill={"transparent"}/>
//          <line x1={x-3} x2={x+3} y1={y+3} y2={y-3} stroke={color} strokeWidth={1} fill={"transparent"}/>
//          <line x1={x-4} x2={x+4} y1={y} y2={y} stroke={color} strokeWidth={1} fill={"transparent"}/>
//          <line x1={x} x2={x} y1={y-4} y2={y+4} stroke={color} strokeWidth={1} fill={"transparent"}/>
//        </>
//      )
//      break;
//
export default LinePlotLog;
