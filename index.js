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
    // d3.csv(file)
    //     .then(data => { console.log(data) });
    // createGameBoard(file);
    // gameboard.toString();
    // gameboard.setScreenBoard();
})

// createGameBoard = (file) => {
//     // Take in the file when it is input and create a board
//     let boardContent = {
//         '#': new Wall(),
//         '.': new OpenTile(),
//         'T': new GreaterTroll(),
//         't': new Troll(),
//         '@': new Player(),
//         'Y': new Amulet(),
//         'h': new Potion(),
//         '^': new Trap()

//     }
//     var reader = new FileReader();

//     reader.readAsBinaryString(file);
//     let board = []; // Set constructor variable to empty array
//     reader.onloadend = function () {
//         // reader.result returns string with board

//         // Save the resulting string
//         let boardString = reader.result;
//         // Split result into array
//         let boardArray = boardString.split('');

//         let rowArray = [];

//         for (let i = 0; i < boardArray.length; i++) {

//             if (boardArray[i] === '\n' && boardArray[i + 1] !== '\n') {

//                 // If newline then dont add this to the array
//                 // Also if multiple newlines in a row then dont add them
//                 let array = [...rowArray]
//                 // Only after first line push the array

//                 board.push(array);

//                 rowArray = []; // Erase array

//             }
//             else if (boardArray[i] !== '\n') {
//                 // Push the content into the array if not a newline
//                 rowArray.push(boardContent[boardArray[i]]);


//             }
//         };

//         let gameboard = new Gameboard(board);
//         gameboard.toString();
//         gameboard.setScreenBoard();

//     }
//     console.log(reader)
// }






// Returns promise
// d3.csv('data.csv')
//     .then(data=>{console.log(data)});

createChart = (file) =>{
    // File is loaded in when called from inputElement event listener
    const svg = d3.select('svg');
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
    
    // Set the xScale using date values, map the domain to the range to fit the page
    let yScale = d3.scaleLinear()
        // Take the domain 'dates' and map them to the x-axis (method chaining)
        .domain([0, d3.max(parsedDataset, d => d[1])]) // (first(earliest) date, last(latest) date)
        .range([margin.left, (innerHeight)]); // Left screen, right screen

    // Map the coutries (parsedDataset[0] to the x axis starting at padding, ending width-padding)
    const xScale = d3.scaleBand()
        .domain(parsedDataset.map(data=>data[0]))
        .range([margin.bottom,innerWidth]);

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
    // Axis takes scale function, determine what values in scale correspond to what pixels
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    /************* AXIS LABELS *******************/
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("y", 2)
        .attr('x', -(height / 2))
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style('font-size', screen.width * 0.01 + "")
        .text("GDP ( billions $ )");

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height - 12)
        .style('font-size', screen.width * 0.01 + "")
        .text("Date (year)");

    /*********** AXES COORDINATES  ************/
    // X-AXIS
    svg.append('g')
        // Define x,y coordinates translation from the left of screen and from top of screen 
        .attr('transform', "translate(0," + (height) + ")") // translate from svg edge to bottom of screen
        .call(xAxis) // Call function x-axis on elements of selection 'g'
        .attr('id', 'x-axis');

    // Y-Axis
    svg.append('g')
        // Translate will define location of y-axis by defining (x,y) translation
        // If didnt add padding to x-coordinate, the y-axis is against the screen
        .attr('transform', "translate(" + 10 + ", 0)") // translate from svg left edge and y coordinate from top of screen
        .call(yAxis) // Call function x-axis on elements of selection 'g'
        .attr('id', 'y-axis');
    // Holds value for the bar chart bars width
    

    // // Tooltip body
    // let tooltip = d3
    //     .select("body")
    //     .append("div")
    //     .attr("id", "tooltip")

    // STEP 2
    svg.selectAll('rect') // Get the set of elements
        .data(parsedDataset)
        .enter() // Create thing that creates rectangle for each row of data
        .append('rect')
        .attr('data-date', xValue+"") // Needs to match date on x-axis
        .attr('data-gdp', yValue+"") // Needs to match gdp of y-axis
        .attr('width', xScale.bandwidth()-10 + "") // Width of bars using xScales band widths
        .attr('height', d => yScale(yValue(d))) // Height is the height - yScale value
        .attr('class', 'bar')
        // X will scale according to its scaling factor
        .attr('x', (d, i) => xScale(xValue(d))) // Location of bars on x-axis
        // Need to subtract the yScaled value from height since scaled it this way
        .attr('y', d => (height-yScale(yValue(d)))+margin.bottom + "") // Makes sure bars arent above x-axis
        .attr("transform", `translate(0,${-margin.bottom})`)
        .style('fill', '#4aa89c')
        .style('margin','2')
    //     // Tooltip
    //     .on("mouseout", function () {
    //         // When mouse stops hovering a specific bar
    //         d3.select(this)
    //             .transition()
    //             .duration(400)
    //             .style("fill", "#4aa89c");
    //         tooltip.style("opacity", 0);
    //         tooltip.style("display", "block")
    //     })
    //     .on("mouseover", function (d, i) {
    //         d3.select(this).style("fill", "a8eddf");
    //         tooltip.attr("id", "tooltip")
    //         tooltip.style("fill", "#a8eddf")
    //         tooltip.style("display", "block")
    //         tooltip.attr("data-date", d[0])
    //         tooltip.style('opacity', 1)
    //         tooltip.html("In " + d[0] + " GDP was " + d[1])
    //             // This will give the coordinates where mouseevent is and put tooltip there
    //             .style("left", (i * barWidth) + padding + "px")
    //             .style("top", height - (2 * padding) + "px")
    //     })



    svg.style('background-color', '#eaebe4');
}




