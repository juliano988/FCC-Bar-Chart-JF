import Head from 'next/head'
import styles from '../styles/App.module.css'
import * as d3 from "d3";
import { DetailedHTMLProps, HTMLAttributes, LegacyRef, MutableRefObject, RefObject, useEffect, useRef } from 'react';

export default function App({ data }): JSX.Element {

  return (
    <div className={styles.container}>
      <Head>
        <title>FCC - Bar Chart</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 id='title'>United States GDP</h1>
        <Graphic data={data} height='80vh' width='80vw' />
    </div>
  )
}

function Graphic(props:{data:any , height:string , width:string}) {
  
  const divRef = useRef<HTMLEmbedElement>(null);

  useEffect(function () {

    const svgHeight = divRef.current.clientHeight;
    const svgWidth = divRef.current.clientWidth;

    const rectBaseWidth = 5;
    const spaceBetweenRect = 1;

    const scaleX = d3.scaleLinear().domain([0, props.data.data.length * rectBaseWidth + props.data.data.length * spaceBetweenRect]).range([0, svgWidth]);
    const scaleY = d3.scaleLinear().domain([0, Math.max(...props.data.data.map(function (val) { return val[1] }))]).range([0, svgHeight]);

    const svg = d3.select(divRef.current)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)

    svg.selectAll('rect')
      .data(props.data.data)
      .enter().append('rect')
      .attr('width', scaleX(rectBaseWidth))
      .attr('height', (d) => scaleY(d[1]))
      .style('fill', 'blue')
      .attr('x', (d, i) => i * scaleX(rectBaseWidth + spaceBetweenRect))
      .attr('y', (d) => svgHeight - scaleY(d[1]))
  }, [])

  return (
    <div ref={divRef} style={{height: props.height , width: props.width , margin:'auto'}}>

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