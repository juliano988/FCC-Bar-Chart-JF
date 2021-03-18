import Head from 'next/head'
import styles from '../styles/App.module.css'
import * as d3 from "d3";
import { useEffect, useRef, useState } from 'react';
import tippy, { followCursor, Instance, Props } from 'tippy.js';
import ReactDOMServer from 'react-dom/server';
import { GraphicProps } from '../customTypes';


export default function App({ data }): JSX.Element {

  return (
    <div className={styles.container}>
      <Head>
        <title>FCC - Bar Chart</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 id='title'>United States GDP</h1>
      <h5 style={{ margin: '0px' }}>More Information: <a href='http://www.bea.gov/national/pdf/nipaguid.pdf' style={{ color: '#3967ff' }}>http://www.bea.gov/national/pdf/nipaguid.pdf</a></h5>
      <Graphic data={data.data} xLabel='Year' yLabel='Gross Domestic Product (Bilions $)' height='60vh' width='75vw' />
    </div>
  )
}

function Graphic(props: GraphicProps): JSX.Element {

  const [forceRender, setForceRender] = useState<number>(0);

  const graphicDivRef = useRef<HTMLEmbedElement>(null);

  const rectBaseWidth = 5;
  const spaceBetweenRect = 1;
  const offset = 50;

  useEffect(function () {

    const svgHeight = graphicDivRef.current.clientHeight;
    const svgWidth = graphicDivRef.current.clientWidth;

    const maxY = Math.max(...props.data.map(function (val) { return val[1] }));
    const minY = Math.min(...props.data.map(function (val) { return val[1] }));
    const maxX = new Date(props.data[props.data.length - 1][0]);
    const minX = new Date(props.data[0][0]);

    const scaleX = d3.scaleLinear().domain([0, props.data.length * rectBaseWidth + props.data.length * spaceBetweenRect]).range([0, svgWidth]);
    const scaleY = d3.scaleLinear().domain([0, maxY]).range([0, svgHeight]);

    const svg = d3.select(graphicDivRef.current)
      .append('svg')
      .attr('width', svgWidth + offset * 2)
      .attr('height', svgHeight + offset * 2)
      .attr('transform', 'translate(' + (-offset) + ',' + (-offset) + ')')

    svg.selectAll('rect')
      .data(props.data)
      .enter().append('rect')
      .attr('class', styles.rectClass)
      .attr('width', scaleX(rectBaseWidth))
      .attr('height', (d) => scaleY(d[1]))
      .style('fill', '#3967ff')
      .attr('x', (d, i) => i * scaleX(rectBaseWidth + spaceBetweenRect) + offset)
      .attr('y', (d) => svgHeight - scaleY(d[1]) + offset)

    const bottomAxis = svg.append('g')
      .attr('transform', 'translate(' + offset + ',' + (svgHeight + offset) + ')')
      .call(d3.axisBottom(d3.scaleTime().domain([minX, maxX]).range([0, svgWidth])))
      .style('font-size', '1rem');
    (window.outerWidth <= 800 && bottomAxis.selectAll('text').attr('transform', 'translate(-20,10) rotate(-45)'))



    const yLabel = svg.append('text')
      .attr('fill', 'white')
      .text(props.yLabel)
    yLabel.attr('transform', 'translate(' + offset / 2 + ',' + (svgHeight / 2 + offset + yLabel.text().length * 3) + ') rotate(-90)');

    const rightAxis = svg.append('g')
      .attr('transform', 'translate(' + (svgWidth + offset) + ',' + offset + ')')
      .call(d3.axisRight(d3.scaleLinear().domain([minY, maxY]).range([svgHeight, 0])).tickSize(-svgWidth).tickPadding(-svgWidth))

    rightAxis.select('path')
      .attr('opacity', '0');

    rightAxis.selectAll('line')
      .attr('stroke-dasharray', '2,2')

    rightAxis.selectAll('text')
      .attr('y', '-10')
      .style('font-size', '1rem')

    const xLabel = svg.append('text')
      .attr('fill', 'white')
      .text(props.xLabel)
    xLabel.attr('transform', 'translate(' + (svgWidth / 2 + offset - xLabel.text().length * 3) + ',' + (svgHeight + offset * 2) + ')');

    const tippyInstanceArr: Array<Instance<Props>> = []
    const tootip = svg.selectAll('rect').each(function (d, i, g: Array<HTMLElement>) {
      return (
        tippyInstanceArr.push(tippy(g[i], {
          content: ReactDOMServer.renderToStaticMarkup(
            <div style={{ backgroundColor: 'darkred', padding: '3px', borderRadius: '3px' }}>
              <p style={{ margin: '2px' }}><strong>Value:</strong> ${d[1]} Bilion</p>
              <p style={{ margin: '2px' }}><strong>Date:</strong> {(d[0] as string).split('-')[0] + '-' + (d[0] as string).split('-')[1].replace(/.+/, function (match) {
                switch (match) {
                  case '01': return 'Q1';
                  case '04': return 'Q2';
                  case '07': return 'Q3';
                  case '10': return 'Q4';
                  default: return '  ';
                }
              })}
              </p>
            </div>),
          allowHTML: true,
          followCursor: true,
          plugins: [followCursor],
          placement: 'left-end',
        }))
      )
    })
    return () => {
      d3.select(graphicDivRef.current)
        .selectChild()
        .remove()
      tippyInstanceArr.map(function (val) { return val.unmount() })
    }
  }, [forceRender]);

  let callForceRender: NodeJS.Timeout;
  useEffect(function () {
    addEventListener('resize', function () {
      clearTimeout(callForceRender);
      callForceRender = setTimeout(function (arg) { setForceRender(arg) }, 500, Math.random());
    })
  })

  return (
    <div style={{ padding: offset }}>
      <div ref={graphicDivRef} style={{ height: props.height, width: props.width, margin: 'auto' }} />
    </div>
  )
}

export async function getStaticProps() {
  // Fetch data from external API
  const res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}