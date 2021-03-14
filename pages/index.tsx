import Head from 'next/head'
import styles from '../styles/App.module.css'
import * as d3 from "d3";
import { useEffect, useRef } from 'react';

export default function App({ data }): JSX.Element {

  const svgRef = useRef(null)

  useEffect(function () {

    const svgHeight = window.innerHeight * 0.75;
    const svgWidth = window.innerWidth * 0.75;

    const rectBaseWidth = 5;
    const spaceBetweenRect = 1

    const scaleX = d3.scaleLinear().domain([0, data.data.length * rectBaseWidth + data.data.length * spaceBetweenRect]).range([0, svgWidth])
    const scaleY = d3.scaleLinear().domain([0, Math.max(...data.data.map(function (val) { return val[1] }))]).range([0, svgHeight])

    const svg = d3.select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight)

    svg.selectAll('rect')
      .data(data.data)
      .enter().append('rect')
      .attr('width', scaleX(rectBaseWidth))
      .attr('height', (d) => scaleY(d[1]))
      .style('fill', 'blue')
      .attr('x', (d, i) => i * scaleX(rectBaseWidth + spaceBetweenRect))
      .attr('y', (d) => svgHeight - scaleY(d[1]))
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>FCC - Bar Chart</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 id='title'>United States GDP</h1>
      <svg ref={svgRef}>

      </svg>
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