// dataset
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
// request
let req = new XMLHttpRequest()

let baseTemp
let values =[]

let xAxis
let yAxis

let xScale
let yScale

// canvas dimensions
let width = 1300
let height = 600
let padding = 90

let svg = d3.select('svg')
let tooltip = d3.select('#tooltip')

let generateScales = () => {
    let minYear = d3.min(values, (item) => {
        return item['year']})
    
    let maxYear = d3.max(values, (item) => {
        return item['year']})

    // xScale
    xScale = d3.scaleLinear()
                .domain([minYear, maxYear + 1])
                .range([padding, width - padding])

    // yScale
    yScale = d3.scaleTime()
                .domain([new Date(0,0,0,0, 0, 0, 0), new Date(0,12,0,0,0,0,0)])
                .range([padding, height - padding])}

// create canvas for rendering               
let drawCanvas = () => {
    svg.attr('width', width)
    svg.attr('height', height)}

// create cells which represent temperatures
let drawCells = () => {
    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class','cell')
        .attr('data-year', (item) => {
            return item['year']
        })
        // set different colours
        .attr('fill', (item) => {
            let variance = item['variance']
            if(variance <= -1){
                return '#b5d9ff'
            }else if(variance <= 0){
                return '#d8ebff'
            }else if(variance <= 1){
                return '#ffaf01'
            }else{
                return '#ef6900'
            }
        })
        .attr('data-month', (item) => {
            return item['month'] - 1
        })
        .attr('data-temp', (item) => {
            return baseTemp + item['variance']
        })
        .attr('height', (item)=> {
            return (height - (2 * padding)) / 12
        })
        .attr('y', (item) => {
            return yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0))
        })
        .attr('x', (item) => {
            return xScale(item['year'])
        })
        .attr('width', (item) => {
            let minYear = d3.min(values, (item) => {
                return item['year']
            })
            
            let maxYear = d3.max(values, (item) => {
                return item['year']
            })

            let yearCount = maxYear - minYear

            return (width - (2 * padding)) / yearCount
        })
        .on('mouseover', (item) => {
            tooltip.transition()
                .style('visibility', 'visible')
            
            let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ]
        
            tooltip.text(item['year'] + ' ' + monthNames[item['month'] -1 ] + ' : ' + item['variance'])

            tooltip.attr('data-year', item['year'])
        })
        .on('mouseout', (item) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
        
}

let generateAxes = () => {

    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format('d'))

    let yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat('%B'))
    // xAxis
    svg.append('g')
        .call(xAxis)
        .attr('id','x-axis')
        .attr('transform', 'translate(0, ' + (height-padding) + ')')
    // yAxis
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)')
    
}

// make a request and get data from the provided dataset, render canvas
req.open('GET', url, true)
req.onload = () => {
    let data = JSON.parse(req.responseText)
    baseTemp = data.baseTemperature
    values = data.monthlyVariance
    console.log(baseTemp)
    console.log(values)
    drawCanvas()
    generateScales()
    drawCells()
    generateAxes()
}
req.send()