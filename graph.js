//set chart dimensions
const dims = { 
    height: 350,
    width: 350,
    radius: 150
}

const cent = {
    x: (dims.width / 2 + 5),
    y: (dims.height / 2 + 5) //the +5 adds padding to each 

}

//create svg container
const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)//adding 150 for the legend
    .attr('height', dims.height + 150) //adding padding 

//create graph
const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`);

//values used to calculate pie angles
const pie = d3.pie()
    .sort(null)
    .value(d => d.quantity);

const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);

//setup ordinal scale for pie chart color
const color = d3.scaleOrdinal(d3['schemeSet3']);//range set to interal d3 color array/

//legend set up
const legendGroup = svg.append('g')
    .attr('transform', `translate(${dims.width + 25 }, 10)`);

const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(color);


//firestore update function
const update = (data) => {

    //update color scale domain
    color.domain(data.map(d => d.flavor))    

    //update and call legend
    legendGroup.call(legend);
    legendGroup.selectAll('text').attr('fill', 'grey');

    //join enhanced (pie) data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data));
    
    //handle the exit selection
    paths.exit()
        .transition()
        .duration(750)
        .attrTween('d', arcTweenExit)
        .remove();

    //update the current DOM path
    paths.attr('d', arcPath)
        .transition()
        .duration(750)
        .attrTween('d', arcTweenUpdate);

    //create arc paths from firstore data
    paths.enter()
        .append('path')
            .attr('class', 'arc')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('fill', d => color(d.data.flavor))
            .each(function(d){ this._current = d })
            .transition().duration(750)
                .attrTween("d", arcTweenEnter);

};


//data array on firestore
let data = [];

db.collection('wings').onSnapshot(res => {
    res.docChanges().forEach(change => {
        
        const doc = {...change.doc.data(), id: change.doc.id };

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }

    });

    update(data)
});

//create tween values for database start and addtions
const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);

    return function(t){
        d.startAngle = i(t)
        return arcPath(d);
    }
}

//create tween values for deletions
const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function(t){
        d.startAngle = i(t)
        return arcPath(d);
    }
}

//use function keyword to allow use of 'this'
function arcTweenUpdate(d) {

    //interpolate between the two objects
    var i = d3.interpolate(this._current, d)
    //udpate current prop with new updated data
    this._current = i(1);

    return function(t){
        return arcPath(i(t));
    }

}