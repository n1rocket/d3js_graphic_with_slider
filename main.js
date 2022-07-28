// CHART START
const width = 800;
const height = 500;
const margin = {
  top: 10,
  bottom: 60,
  left: 60,
  right: 10,
};
let dataOrig;
let maxWinners;

// Defino SVG y Grupos:
const svg = d3
  .select("div#chart")
  .append("svg")
  .attr("class", "svg")
  .attr("width", width)
  .attr("height", height);

//Aplicamos una transformación para mover la posición de todo el grupo ya que quedaba pegado a la izquierda
const elementGroup = svg
  .append("g")
  .attr("class", "svg-content")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const axisGroup = svg.append("g").attr("id", "axisGroup");

const xAxisGroup = axisGroup
  .append("g")
  .attr("id", "xAxisGroup")
  .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`);

const yAxisGroup = axisGroup
  .append("g")
  .attr("id", "yAxisGroup")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Escalas
const x = d3.scaleLinear().range([0, width - margin.left - margin.right]);
const y = d3
  .scaleBand()
  .range([0, height - margin.top - margin.bottom])
  .padding(0.1); //Para separar en X

//Definir ejes
const xAxisTicks = x.ticks().filter((tick) => Number.isInteger(tick));

const xAxis = d3.axisBottom().scale(x).ticks(4).tickFormat(d3.format("d"));

const yAxis = d3.axisLeft().scale(y);

loadData();

function loadData() {
  d3.csv("data.csv").then((dataLoaded) => {
    console.log(dataLoaded);
    dataOrig = dataLoaded;

    //Transformar datos (se agrupan por el campo ganador para poder realizar el conteo)
    dataOrig.forEach((d) => {
      d.year = +d.year;
    });

    slider(dataOrig.map((d) => d.year));

    updateChart();
  });
}

function updateChart(yearLimit) {
  //Eliminamos los años límites
  dataFiltered = dataOrig;
  if (yearLimit != undefined) {
    dataFiltered = dataFiltered.filter((d) => d.year <= yearLimit);
  }

  let data = d3
    .nest()
    .key((d) => d.winner)
    .sortKeys(d3.ascending) // Ordeno la información alfabéticamente
    .entries(dataFiltered);

  //Eliminamos los años que no hubo ganadores
  data = data.filter((d) => {
    return d.key != "";
  });

  console.log(data);

  maxWinners = d3.max(data.map((d) => d.values.length));

  //Dominio
  x.domain([0, maxWinners]);
  y.domain(data.map((d) => d.key));

  // Dibujar
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // Data binding
  let elements = d3
    .select(".svg")
    .select(".svg-content")
    .selectAll("g.group-content")
    .data(data);

  //elementGroup.selectAll("g.group-content").data(data);

  elementsEnter = elements
    .enter()
    .append("svg:g")
    .attr("class", "group-content metooltip");

  //elementsEnter.attr("class", (d) => "metooltip");

  elementsEnter
    .append("svg:g")
    .attr("class", "rect-content")
    .append("svg:rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.key))
    .attr("height", y.bandwidth())
    .attr("fill", (d) =>
      d.values.length == maxWinners ? "crimson" : "cadetblue"
    )
    .transition()
    .duration(300)
    .attr("width", (d) => x(d.values.length));

  elements
    .select(".rect-content")
    .select("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.key))
    .attr("height", y.bandwidth())
    .attr("fill", (d) =>
      d.values.length == maxWinners ? "crimson" : "cadetblue"
    )
    .transition()
    .duration(300)
    .attr("width", (d) => x(d.values.length));

  elementsEnter
    .append("svg:g")
    .attr("class", "text-content metooltiptext")
    .append("text")
    .text((d) => d.values.length)
    .attr("x", (d) => x(d.values.length) - 20)
    .attr("y", (d) => {
      console.log(y(d.key));

      return y(d.key) + 5 + y.bandwidth() / 2;
    })
    .attr("text-anchor", "middle")
    .attr("style:fill", "white");

  elements
    .select(".text-content")
    .select("text")
    .text((d) => d.values.length)
    .attr("x", (d) => x(d.values.length) - 20)
    .attr("y", (d) => y(d.key) + 5 + y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("style:fill", "white");

  elements.exit().remove();
}

// CHART END

// slider:
function slider(years) {
  console.log(years);

  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(years)) // rango años
    .max(d3.max(years))
    .step(4) // cada cuánto aumenta el slider
    .width(580) // ancho de nuestro slider
    .ticks(years.length)
    .default(years[years.length - 1]) // punto inicio de la marca
    .on("onchange", (val) => {
      updateChart(val);
      d3.select("p#value-time").text(sliderTime.value());
    });

  var gTime = d3
    .select("div#slider-time") // div donde lo insertamos
    .append("svg")
    .attr("width", width * 0.8)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gTime.call(sliderTime);

  d3.select("p#value-time").text(sliderTime.value());
}
