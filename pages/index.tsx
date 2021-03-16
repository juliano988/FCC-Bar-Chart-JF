import Head from 'next/head'
import styles from '../styles/App.module.css'
import * as d3 from "d3";
import { useEffect, useRef } from 'react';
import tippy from 'tippy.js';
import Tippy from '@tippyjs/react';
import ReactDOMServer from 'react-dom/server';


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

function Graphic(props: { data: { data: Array<[date: string, value: number]> }, height: string, width: string }): JSX.Element {

  const divRef = useRef<HTMLEmbedElement>(null);

  useEffect(function () {

    const svgHeight = divRef.current.clientHeight;
    const svgWidth = divRef.current.clientWidth;

    const rectBaseWidth = 5;
    const spaceBetweenRect = 1;
    const offset = 25;

    const maxY = Math.max(...props.data.data.map(function (val) { return val[1] }))
    const minY = Math.min(...props.data.data.map(function (val) { return val[1] }))
    const maxX = new Date(props.data.data[props.data.data.length - 1][0])
    const minX = new Date(props.data.data[0][0])

    const scaleX = d3.scaleLinear().domain([0, props.data.data.length * rectBaseWidth + props.data.data.length * spaceBetweenRect]).range([0, svgWidth]);
    const scaleY = d3.scaleLinear().domain([0, maxY]).range([0, svgHeight]);

    const svg = d3.select(divRef.current)
      .append('svg')
      .attr('width', svgWidth + offset * 2)
      .attr('height', svgHeight + offset * 2)
      .attr('transform', 'translate(' + -offset + ',0)')

    svg.selectAll('rect')
      .data(props.data.data)
      .enter().append('rect')
      .attr('class', styles.rectClass)
      .attr('width', scaleX(rectBaseWidth))
      .attr('height', (d) => scaleY(d[1]))
      .style('fill', 'blue')
      .attr('x', (d, i) => i * scaleX(rectBaseWidth + spaceBetweenRect) + offset)
      .attr('y', (d) => svgHeight - scaleY(d[1]) + offset)

    const bottomAxis = svg.append('g')
      .attr('transform', 'translate(' + offset + ',' + (svgHeight + offset) + ')')
      .call(d3.axisBottom(d3.scaleTime().domain([minX, maxX]).range([0, svgWidth])))
      .style('font-size', '1rem')

    const rightAxis = svg.append('g')
      .attr('transform', 'translate(' + (svgWidth + offset) + ',' + offset + ')')
      .call(d3.axisRight(d3.scaleLinear().domain([minY, maxY]).range([svgHeight, 0])).tickSize(-svgWidth).tickPadding(-svgWidth))

    rightAxis.selectAll('line')
      .attr('stroke-dasharray', '2,2')

    rightAxis.selectAll('text')
      .attr('y', '-10')
      .style('font-size', '1rem')

    svg.selectAll('rect').each(function (d, i, g) {
      return (
        // console.log(d)
        tippy(g[i], {
          allowHTML: true,
          delay: 0,
          content: ReactDOMServer.renderToStaticMarkup(
          <div style={{backgroundColor: 'beige' , paddingLeft: '10px', paddingRight: '10px'}}>
            <p style={{margin: '0px'}}><strong>Value:</strong> ${d[1]} Bilion</p>
            <p style={{margin: '0px'}}><strong>Date:</strong> {d[0]}</p>
          </div>
          )
        })
      )
    })

    console.log()

  }, [])

  return (
    <div ref={divRef} style={{ height: props.height, width: props.width, margin: 'auto' }} />
  )
}

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}