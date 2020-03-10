function filterData(data) {
    choices = [];
    d3.selectAll("input[type=checkbox]").each(function (d) {
        cb = d3.select(this);
        if (cb.property("checked")) {
            choices.push(cb.property("value"));
        }
    });

    if (choices.length > 0) {
        filteredData = data.filter(function (d, i) {
            return choices.includes(d.continent);
        });
    } else {
        filteredData = data;
    }
    return filteredData;
}

function groupData(data) {
    var agg = d3.select('input[name="aggregate"]:checked').node().value;

    if (agg === 'default') {
        return data;
    }
    else {
        rowsByContinents = d3.nest()
            .key(function (d) {
                return d.continent
            })
            .rollup(function (d) {
                return {
                    'name': d[0].continent,
                    'continent': d[0].continent,
                    'gdp': d3.sum(d, function (g) {
                        return + g.gdp;
                    }),
                    'life_expectancy': d3.mean(d, function (g) {
                        return g.life_expectancy;
                    }),
                    'population': d3.sum(d, function (g) {
                        return g.population;
                    }),
                    'year': d[0].year
                };

            })
            .entries(data);
        return asArray(rowsByContinents);
    }
}

function asArray(groups) {
    values = [];

    for (let i = 0; i < groups.length; i++) {
        values.push(groups[i].value);
    }

    return values;
}

function selectDataByYear(data, year) {
    var yearSelected = d3.select('input[type=range]').node().valueAsNumber;

    if (data === undefined) {
        data = loadedData;
    }
    if (year === undefined) {
        year = yearSelected;
    }

    var min_value = document.getElementById("min_year_label").innerText;
    yearIndex = year - min_value;

    return data.map(function (row) {
        return {
            'name': row.name,
            'continent': row.continent,
            'gdp': row.years[yearIndex]["gdp"],
            'life_expectancy': row.years[yearIndex]['life_expectancy'],
            'population': row.years[yearIndex]['population'],
            'year': yearSelected,
        }
    })
}

function barchartParams(data, inputParams) {
    params = {
        'margin': {top: 20, bottom: 150, left: 200, right: 150},
        'textW': 10,
        'barH': 20
    };

    params['width'] = 1000 - params['margin'].left - params['margin'].right;
    params['height'] = params['barH'] * data.length * 3 / 2;

    params['min'] = 0;
    params['max'] = d3.max(data, function (d) {
        return d[inputParams['encoder']];
    });

    params['xScale'] = d3.scaleLinear()
        .domain([params['min'], params['max']])
        .range([0, params['width']]);


    params['yScale'] = d3.scaleBand()
        // .range([0, params['barH'] * data.length]);
        .range([params['height'], 0])
        .domain(data.map(function(d){
            return d[inputParams['aggregateBy']]; //here
        }));

    switch(inputParams['encoder']){
        case 'population':{
            params['xAxis'] = d3.axisBottom(params['xScale']).ticks(3).tickFormat(d3.format(",.0f"));
            break;
        }
        case 'gdp': {
            params['xAxis'] = d3.axisBottom(params['xScale']).ticks(3).tickFormat(d3.format(".0s"));
            break;
        }
    }

    params['yAxis'] = d3.axisLeft(params['yScale']);

    return params;

}

function selectedInputParams() {
    params = {
        'aggregateBy': d3.select('input[name="aggregate"]:checked').node().value,
        'sortBy': d3.select('input[name=sort]:checked').node().value,
        'encoder': d3.select('input[name=encoder]:checked').node().value,
    };
    return params;
}

function sortData(data, sortBy) {
    if (sortBy === 'name') {
        data.sort(function (x, y) {
            return d3.ascending(x[sortBy], y[sortBy]);
        });
    } else {
        data.sort(function (x, y) {
            return d3.descending(x[sortBy], y[sortBy]);
        });
    }
    return data;
}

function updateBarchart(data) {
    d3.selectAll('g').remove();
    d3.selectAll('svg').remove();

    inputParams = selectedInputParams();
    barParams = barchartParams(data, inputParams);

    data = sortData(data, inputParams['sortBy']);

    var svg = d3.select("body")
        .append("svg")
        .attr('width', barParams['width'] + barParams['margin'].left + barParams['margin'].right)
        .attr('height', barParams['height'] + barParams['margin'].top + barParams['margin'].bottom);

    var g = svg.append('g')
        .attr("transform", "translate(" + barParams['margin'].left + "," + barParams['margin'].top + ")");

    var groups = g
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr('transform', function (d, i) {
            return "translate(0," + i * barParams['barH'] + ")";
        });

    groups.append("text")
        .text(function (d) {
            return d['name']
        })
        .attr("x", barParams['xScale'](0) - 15)
        .attr("y", function (d) {
            return barParams['yScale'](d[inputParams['aggregateBy']]) + 9;
        })
        .attr("dy", ".34em")
        .attr("text-anchor", "end");

    var bars = groups
        .append('rect')
        .transition().duration(600)
        .attr('width', function(d){
            return barParams['xScale'](d[inputParams['encoder']]);
        })
        .attr('height', barParams['barH'])
        .attr('x', barParams['xScale'](0))
        .attr('y', function(d){
            return barParams['yScale'](d[inputParams['aggregateBy']]);
        })
        .style('fill', function(d, i){
            return colors(i);
        });
    // var t = d3.selectAll('rect');
    // t.attr("fill", function (d, i) {
    //     return colors(i);
    // });
    bars.select("rect");
}


function colors(n) {
    var colores_g = [
        "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477",
        "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc",
        "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"
    ];
    return colores_g[n % colores_g.length];
}

function setYears(data) {
    var years = [];
    _row = data[0]['years'];
    for (_year in _row){
        years.push(_row[_year]['year']);
    }

    let unique = [...new Set(years)];

    var min_value = Math.min(...unique);
    var max_value = Math.max(...unique);

    var _slider = document.getElementsByClassName("slider")[0];
    _slider.min = min_value;
    _slider.max = max_value;
    _slider.value = max_value;

    var _min = document.getElementById("min_year_label");
    _min.innerHTML = min_value;
    var _max = document.getElementById("max_year_label");
    _max.innerHTML = max_value;
}

// colores_g = ["#95d261", "#64b7e7", "#ed942e", "#ab40e8", "#ed2a1b"];
d3.json("data/countries_1995_2012.json", function (error, data) {
    loadedData = data;
    continents = d3.map(loadedData, function(d){
        return d.continent;}).keys();
    setYears(loadedData);
    updateBarchart(filterData(groupData(selectDataByYear(loadedData))));
});

d3.selectAll("input[type=range]").on("change", function () {
    updateBarchart(filterData(groupData(selectDataByYear(loadedData))));
});

d3.selectAll("input[type=checkbox]").on("change", function () {
    updateBarchart(filterData(groupData(selectDataByYear(loadedData))));
});

d3.selectAll("input[type=radio]").on("change", function () {
    updateBarchart(filterData(groupData(selectDataByYear(loadedData))));
});
