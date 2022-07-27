// CHART START
const width = 800
const height = 500
const margin = {
  top: 10,
  bottom: 60,
  left: 60,
  right: 10,
}

// Defino SVG y Grupos:
const svg = d3.select("div#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

//Aplicamos una transformación para mover la posición de todo el grupo ya que quedaba pegado a la izquierda
const elementGroup = svg.append("g")
  .attr("id", "elementGroup")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  
const axisGroup = svg.append("g")
  .attr("id", "axisGroup")
  
const xAxisGroup = axisGroup.append("g")
  .attr("id", "xAxisGroup")
  .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)

const yAxisGroup = axisGroup.append("g")
  .attr("id", "yAxisGroup")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

//Escalas
const x = d3.scaleLinear().range([0, width - margin.left - margin.right])
const y = d3.scaleBand().range([0, height - margin.top - margin.bottom])
  .padding(0.1) //Para separar en X

//Definir ejes
const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

d3.csv("data.csv").then( dataOrig => {
    console.log(dataOrig)

    //Transformar datos (se agrupan por el campo ganador para poder realizar el conteo)
    data = d3.nest()
    .key(d => d.winner)
    .sortKeys(d3.ascending) // Ordeno la información alfabéticamente
    .entries(dataOrig)

    //Eliminamos los años que no hubo ganadores
    data = data.filter( d => { return d.key != "" })
    console.log(data)

    //Dominio
    x.domain([0, d3.max(data.map(d => d.values.length))])
    y.domain(data.map(d => d.key))

    // Dibujar
    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    // Data binding
    let elements = elementGroup.selectAll("g").data(data)
    elements.enter()
        .append("g")
        .call(addBar)
})

function addBar(group){
    group.attr("class", d => "metooltip") //He tenido que modificar el tooltip para que no me lo sobrescriba el de bootstrap del slider
  
    group.append("rect")
        .attr("x", 0)
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.values.length) - margin.left - margin.right)
    
        //.attr("fill", "black")
  
    group.append("text")
        .attr("class", "metooltiptext")
        .text(d => d.values.length)
        .attr("x", d => x(d.values.length) - margin.left - margin.right - 20)
        .attr("y", d => y(d.key) + 28)
        .attr("text-anchor", "middle")
        .attr("style:fill", "white")
  }




// CHART END

// slider:
function slider() {    
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años
        .max(d3.max(years))
        .step(4)  // cada cuánto aumenta el slider
        .width(580)  // ancho de nuestro slider
        .ticks(years.length)  
        .default(years[years.length -1])  // punto inicio de la marca
        .on('onchange', val => {
            console.log("La función aún no está conectada con la gráfica")
            // conectar con la gráfica aquí
        });

        var gTime = d3
        .select('div#slider-time')  // div donde lo insertamos
        .append('svg')
        .attr('width', width * 0.8)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);

        d3.select('p#value-time').text(sliderTime.value());
}