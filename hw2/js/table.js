let loadedData;
let isDescending = true;
let sortingFunc;
let sortingColumn;

columns = [
    {head: 'name', cl: 'center', html: f('name')},
    {head: 'continent', cl: 'center', html: f('continent')},
    {head: 'gdp', cl: 'right', html: f('gdp', d3.format(',.2s'))},
    {head: 'life_expectancy', cl: 'right', html: f('life_expectancy', d3.format('.1f'))},
    {head: 'population', cl: 'right', html: f('population', d3.format(',.0f'))},
    {head: 'year', cl: 'right', html: f('year', d3.format('.0f'))}
];

// data formatting from d3-jetpack (https://github.com/gka/d3-jetpack/blob/master/src/f.js)
function f() {
    var entries = arguments;
    var i = 0;
    var len = entries.length;
    while (i < len) {
        if (typeof (entries[i]) === 'string' || typeof (entries[i]) === 'number') {
            entries[i] = (function (str) {
                return function (d) {
                    return d[str];
                };
            })(entries[i]);
        }
        i++;
    }
    return function (d) {
        var i = 0;
        len = entries.length;
        while (i++ < len) {
            d = entries[i - 1].call(this, d);
        }
        return d;
    };
}

function createTable(data) {
    var table = d3.select("body")
        .append("table")
        .attr("class", "table");
    var thead = table
        .append("thead")
        .attr("class", "thead");
    var tbody = table
        .append("tbody");

    table.append("caption")
        .html("World Countries Ranking");

    headers = thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function (d) {
            return d.head;
        });

    headers.on("click", function (header) {
        headers.attr('class', 'header');
        if (header.head !== sortingColumn){
            isDescending = true;
        }
        sortingColumn = header.head;
        if (isDescending) {
            isDescending = false;
            sortingFunc = d3.ascending;
            this.className = 'ascending';
        } else {
            isDescending = true;
            sortingFunc = d3.descending;
            this.className = 'descending';
        }
        tbody.selectAll("tr.row").sort(function (a, b) {
            diff = sortingFunc(a[sortingColumn], b[sortingColumn]);
            return diff;
        });
    });

    var rows = tbody.selectAll("tr.row")
        .data(data)
        .enter()
        .append("tr")
        .attr("class", "row");

    var cells = tbody.selectAll('tr.row')
        .selectAll('td')
        .data(fillCells)
        .enter()
        .append('td')
        .html(f('html'))
        .attr('class', f('cl'));
}


fillCells = function (row, i) {
    return columns.map(function (c) {
        var cell = {};
        d3.keys(c).forEach(function (k) {
            cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
        });
        return cell;
    });
};

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
        })
    } else {
        filteredData = data;
    }

    return filteredData;
}

function groupData(data) {
    var agg = d3.select('input[name="aggregate"]:checked').node().value;

    if (agg === 'default') {
        return data;
    } else {
        rowsByContinents = d3.nest()
            .key(function (d) {
                return d.continent
            })
            .rollup(function (d) {
                return {
                    'name': d[0].continent,
                    'continent': d[0].continent,
                    'gdp': d3.sum(d, function (g) {
                        return +g.gdp;
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

function updateTableContent(data) {
    tbody = d3.select('tbody');
    rows = tbody.selectAll("tr.row")
        .data(data);
    rows.exit().remove();
    rows = rows
        .enter()
        .append("tr")
        .attr("class", "row")
        .merge(rows);
    cells = rows.selectAll("td")
        .data(fillCells);
    cells.exit()
        .remove();
    cells = cells.enter()
        .append("td");
    tbody.selectAll("td")
        .html(f("html"))
        .attr("class", f("cl"));

    tbody.selectAll("tr.row").sort(function (a, b) {
        diff = sortingFunc(a[sortingColumn], b[sortingColumn]);
        return diff;
    });
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

d3.json("data/countries_1995_2012.json", function (error, data) {
    loadedData = data;
    setYears(data);
    createTable(selectDataByYear(data));
});

d3.selectAll("input[type=range]").on("change", function () {
    updateTableContent(filterData(groupData(selectDataByYear(loadedData))));
});

d3.selectAll("input[type=checkbox]").on("change", function () {
    updateTableContent(filterData(groupData(selectDataByYear(loadedData))));
});

d3.selectAll('input[name="aggregate"]').on("change", function () {
    updateTableContent(filterData(groupData(selectDataByYear(loadedData))));
});
