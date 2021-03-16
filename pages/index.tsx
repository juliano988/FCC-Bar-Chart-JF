import Head from 'next/head'
import styles from '../styles/App.module.css'
import * as d3 from "d3";
import * as axis from "d3-axis";
import { DetailedHTMLProps, HTMLAttributes, LegacyRef, MutableRefObject, RefObject, useEffect, useRef } from 'react';
import { Interface } from 'node:readline';

export default function App({ data }): JSX.Element {

  return (
    <div className={styles.container}>
      <Head>
        <title>FCC - Bar Chart</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 id='title'>United States GDP</h1>
        <Graphic data={data} height='75vh' width='75vw' />
    </div>
  )
}

function Graphic(props:{data:{data:Array<[date:string,value:number]>}, height:string , width:string}) {
  
  const divRef = useRef<HTMLEmbedElement>(null);

  useEffect(function () {

    console.log(props.data)

    const svgHeight = divRef.current.clientHeight;
    const svgWidth = divRef.current.clientWidth;

    const rectBaseWidth = 5;
    const spaceBetweenRect = 1;
    const offset = 25;

    const maxY = Math.max(...props.data.data.map(function(val){return val[1]}))
    const minY = Math.min(...props.data.data.map(function(val){return val[1]}))
    const maxX = new Date(props.data.data[props.data.data.length - 1][0])
    const minX = new Date(props.data.data[0][0])

    const scaleX = d3.scaleLinear().domain([0, props.data.data.length * rectBaseWidth + props.data.data.length * spaceBetweenRect]).range([0, svgWidth]);
    const scaleY = d3.scaleLinear().domain([0, maxY]).range([0, svgHeight]);

    const svg = d3.select(divRef.current)
      .append('svg')
      .attr('width', svgWidth + offset * 2)
      .attr('height', svgHeight + offset * 2)
      .attr('transform','translate('+-offset+',0)')

    svg.selectAll('rect')
      .data(props.data.data)
      .enter().append('rect')
      .attr('width', scaleX(rectBaseWidth))
      .attr('height', (d) => scaleY(d[1]))
      .style('fill', 'blue')
      .attr('x', (d, i) => i * scaleX(rectBaseWidth + spaceBetweenRect) + offset)
      .attr('y', (d) => svgHeight - scaleY(d[1]) + offset)

    const bottomAxis =  svg.append('g')
       .attr('transform', 'translate('+offset+','+(svgHeight + offset)+')')
       .call(d3.axisBottom(d3.scaleTime().domain([minX,maxX]).range([0,svgWidth])))
       .style('font-size','1rem')

    const rightAxis = svg.append('g')
       .attr('transform','translate('+(svgWidth + offset)+','+offset+')')
       .call(d3.axisRight(d3.scaleLinear().domain([maxY,minY]).range([0,svgHeight])).tickSize(-svgWidth).tickPadding(-svgWidth))

    rightAxis.selectAll('line')
             .attr('stroke-dasharray','2,2')
      
    rightAxis.selectAll('text')
             .attr('y','-10')
             .style('font-size','1rem')

  }, [])

  return (
    <div ref={divRef} style={{height: props.height , width: props.width , margin:'auto'}}>
      <path  ></path>
    </div>
  )
}

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}