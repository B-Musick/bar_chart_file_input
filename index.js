// Select the first file in the nodes file list, returns File Object
const inputElement = document.getElementById("fileItem");
inputElement.addEventListener("change", (e) => {

    var file = document.getElementById('fileItem').files[0];
    // const fileList = this.files; /* now you can work with the file list */
    
    var reader = new FileReader();
    reader.readAsText(file);
    
    reader.onloadend = function(){
        
        let split = reader.result.split('\n');
        createChart(split);
        
    }
})


createChart = (file) =>{
    console.log(file)
    // File is loaded in when called from inputElement event listener
    const svg = d3.select('svg');

    // Remove all the data so when new file loaded it doesnt overlap
    svg.selectAll("*").remove();
    const title = document.getElementById('title');

    // Remove the first value from the array which is the title
    title.textContent = file.shift();
    
    // Remove the second values from the array which are the [x,y] values
    let axesTitles = file.shift().split(',');
    
    // dataset will be an array of arrays, the first value being the date, second the gdp
    let dataset = []

    // Get width and heights values, + parses the values to float
    const width = 0.70 * screen.width;
    const height = 0.70 * screen.height;
    
    // Use to style and set scales
    const margin = {top:60, right:60,bottom:60,left:60};
    let innerWidth = width-margin.left-margin.right;
    let innerHeight = height-margin.top-margin.bottom;

    file.forEach((val) => {
        // Push the data into the array([val1, val1]), turn them into arrays
        dataset.push(val.split(','));
    })
    // Since the second values in the array should be numbers, parse them
    let parsedDataset = dataset.map(arr=>{
        return [arr[0],parseInt(arr[1])];
    });
    
    /***************************** SCALES  *************************************/
    // Map the coutries (parsedDataset[0] to the x axis starting at padding, ending width-padding)
    const xScale = d3.scaleBand()
        .domain(parsedDataset.map(data=>data[0]))
        .range([0,innerWidth]);

    // Set the xScale using date values, map the domain to the range to fit the page
    let yScale = d3.scaleLinear()
        // Take the domain 'dates' and map them to the x-axis (method chaining)
        .domain([0,d3.max(parsedDataset, d => d[1])]) // (first(earliest) date, last(latest) date)
        .range([innerHeight,0]); // Left screen, right screen


    // Use these to prevent repetative data
    // Replace whole equation d=>d[0]
    // Replace part - d => xValue(d)
    const xValue = d => d[0];
    const yValue = d => d[1];

    // Check that domain is mapped properly
    console.log(xScale.domain())
    console.log(xScale.range())

    // console.log(yScale('1000')) // Test scale

    /***************************** AXES **************************************/

    /************* AXIS LABELS *******************/
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("y", 2)
        .attr('x', -(height / 2))
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style('font-size', screen.width * 0.01 + "")
        .text(`${axesTitles[1]}`);

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height - 12)
        .style('font-size', screen.width * 0.01 + "")
        .text(`${axesTitles[0]}`);

    /*********** AXES COORDINATES  ************/

    const g = svg.append('g')
        .attr('transform',`translate(${margin.left},${margin.top})`);
    // Axis takes scale function, determine what values in scale correspond to what pixels
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // X-AXIS
    g.append('g')
        // Define x,y coordinates translation from the left of screen and from top of screen 
        .attr('transform', `translate(0,${innerHeight})`) // translate from svg edge to bottom of screen
        .call(xAxis) // Call function x-axis on elements of selection 'g'
        .attr('id', 'x-axis')
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-35)");


    // Y-Axis
    g.append('g')
        // Translate will define location of y-axis by defining (x,y) translation
        // If didnt add padding to x-coordinate, the y-axis is against the screen
        // .attr('transform', "translate(" +(margin.left) + ", 0)") // translate from svg left edge and y coordinate from top of screen
        .call(yAxis) // Call function x-axis on elements of selection 'g'
        .attr('id', 'y-axis');
    // Holds value for the bar chart bars width
    

    // Tooltip body
    let tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip")

    
    // STEP 2
    g.selectAll('rect') // Get the set of elements
        .data(parsedDataset)
        .enter() // Create thing that creates rectangle for each row of data
        .append('rect')
        .attr('data-country', xValue+"") // Needs to match date on x-axis
        .attr('data-gdp', yValue+"") // Needs to match gdp of y-axis
        .attr('width', xScale.bandwidth()-10 + "") // Width of bars using xScales band widths
        .attr('height', d => innerHeight-yScale(yValue(d))) // Height is the height - yScale value
        .attr('class', 'bar')
        // X will scale according to its scaling factor
        .attr('x', (d, i) => {return 5+xScale(xValue(d))}) // Location of bars on x-axis
        // Need to subtract the yScaled value from height since scaled it this way
        .attr('y', d => (yScale(yValue(d))) + "") // Makes sure bars arent above x-axis
        
        .style('fill', '#4aa89c')
        .style('margin','2')
        // Tooltip
        .on("mouseout", function () {
            // When mouse stops hovering a specific bar
            d3.select(this)
                .transition()
                .duration(400)
                .style("fill", "#4aa89c");
            tooltip.style("opacity", 0);
            tooltip.style("display", "block")
        })
        .on("mouseover", function (d, i) {
            d3.select(this).style("fill", "a8eddf");
            tooltip.attr("id", "tooltip")
            tooltip.style("fill", "#a8eddf")
            tooltip.style("display", "block")
            tooltip.style('height', '50px')
            tooltip.attr("data-country", d[0])
            tooltip.style('opacity', 1)
            tooltip.html(d[0] + " - " + d[1])
                // This will give the coordinates where mouseevent is and put tooltip there
                .style("left", ((screen.width*0.2)+i*xScale.bandwidth())+"px")
                .style("top", height - (2 * margin.bottom) + "px")
        })



    svg.style('background-color', '#eaebe4');
}

// jQuery which initiates the graph when the page loads
$.get('data.csv', function (data) {
    let split = data.split('\n');
    createChart(split);
});



