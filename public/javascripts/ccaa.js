/*****************************FUNCIONES PRINCIPALES**************************************/
/*Entrada principal a la ejecución del script*/
function start() {
  showVis(!1);
	$("#type").change(function () {changeCurrentMode($(this).val())});
	currentMode = MODE_PER_PERSON;
	currentYear = availableYears[availableYears.length-1];
	updatePlayBtn();
	loadPopulation();
}

function update() {
  updateBarChart();
	updateColors();
  if (_selectedRegion != null || regSelected != null) {
    var a = regSelected;
    _selectedRegion != null && (a = _selectedRegion.ID);
  	showRegionInfo(a)
  } else 
    showCountryInfo();
  updateNavigationBar()
}

/*Lanza un mensaje de aviso de descarga de datos hasta que se completa la carga*/
function showVis(a) {
    var b = d3.select("#main");
    b.style("visibility", a == !0 ? "visible" : "hidden");
    var b = d3.select("#loading");
    b.style("display", a == !1 ? "" : "none")
}

/********************************FUNCIONES DE CARGA DE DATOS****************************/
/*Lanzamos la carga de los censos*/
function loadPopulation() {
  for (var a = 0; a < availableYears.length; a++) {
		loadPopulationByYear(availableYears[a])
	}
}

/*Carga los datos de los censos anuales */
function loadPopulationByYear(a) {
  var b = "/data/Censo" + a + ".csv";
  d3.csv(b, function (b) {
    var c = d3.nest()
        			.key(function (a) {return a.Idcomu;})
        			.rollup(function (a) {return formatCensoData(a)})
        			.map(b);
    d = [];
    for (var f in c) d.push(c[f].value);

  	var g = d3.max(d),
        h = d3.min(d);
    populationByRegionByYear[a] == null && (populationByRegionByYear[a] = {});
  	populationByRegionByYear[a].max = g;
  	populationByRegionByYear[a].min = h;
  	populationByRegionByYear[a].data = c;
  	loadedData++;
  	checkDataLaoded();
  })
}

/*Vamos verificando los datos cargados y al llegar al máximo lanzamos la captura de los presupuestos*/
function checkDataLaoded() {
  _dataLoaded = loadedData == maxTotalData ? !0 : !1;
	_dataLoaded && loadBalance()
}

/*Carga los datos de los presupuestos*/
function loadBalance() {
  var a = "/data/Budget_2006_2010.csv";
  d3.csv(a, function (a) {
    balanceByYearAndByRegion = d3.nest()
                  								.key(function (a) {return a.Ano})
                  								.key(function (a) {return a.Idcomu})
                  								.rollup(function (a) {return formatBudgetDataYR(a)})
                  								.map(a);
  	balanceByYearByType = d3.nest()
              							.key(function (a) {return a.Ano})
              							.key(function (a) {return a.Codigo})
              							.rollup(function (a) {return formatBudgetDataYT(a)})
              							.map(a);
  	balanceByYearByRegionByType = d3.nest()
                  									.key(function (a) {return a.Ano})
                  									.key(function (a) {return a.Idcomu})
                  									.key(function (a) {return a.Codigo})
                  									.rollup(function (a) {return formatBudgetDataYRT(a)})
                  									.map(a); 
  	calculateDataPerPerson(); 
  	loadMap()
  })
}

/*Carga los datos del MAPA (GeoJson)*/
function loadMap() {
	//Creamos un elemento svg con un grupo anidado
	d3.select("#vis #map")
		.append("svg:svg")
		.attr("id", "svg")
		.append("svg:g")
		.attr("id", "states");
					
	d3.json("/data/map/ccaa_5km.json", function (a) {
    _geoData = a;
    var b = d3.select("#states")
        			.selectAll("path")
        			.data(_geoData.features);
		
		b.enter().append("svg:path")
			.attr("d", function (a) {return path_proj(a)})
			.attr("class", function (a, b) {return "region_" + a.properties.ID})
			.style("stroke", function () {return "#000000"})
			.style("stroke-width", function () {return 1})
			.on("mouseover", function (a, b) {return mouseOverMap(a)})
			.on("mouseout", function (a, b) {return mouseOutMap(a)})
			.on("click", function (a, b) {return clickMap(a)});;
		
		createBarCharts();
		refresh();
		update();
		showVis(!0)
  })
}

/******************************FUNCIONES DE LOS CONTROLES*************************************************/
/*Acceso directo a $("#sumtype_total").click()*/
function selectTotalAmount() {
  $("#sumtype_total").click()
}
/*Acceso directo a $("#sumtype_perperson").click()*/
function selectPerPerson() {
  $("#sumtype_perperson").click()
}
function updatePlayBtn() {
  var a = intervalID == null ? "play" : "pause";
	$("#playBtn").removeClass();
	$("#playBtn").addClass(a);
}
function toggleAnim() {
  intervalID != null ? stopUpdate() : startUpdate();
}
function changeCurrentMode(a) {
  currentMode = a; 
	update()
}
$("#playBtn").click(function () {
  toggleAnim()
});
$("#sumtype_perperson").click(function () {
  changeCurrentMode(MODE_PER_PERSON)
});
$("#sumtype_total").click(function () {
  changeCurrentMode(MODE_TOTAL)
});

/**************************************FUNCIONES DEL NAVBAR**************************************************/
function updateNavigationBar() {
  var a = availableYears.length;
      b = d3.entries(availableYears);
      c = d3.select("#yearnavbar");
	d = 0;
    
	c.text("");
  b.forEach(function (b) {
    if (currentYear == b.value) 
    	c.append("span")
    	 .attr("class", "yearselect")
    	 .style("float", "left")
    	 .text(b.value);
    else {
      var e = "yearsel_" + b.value;
      c.append("div")
  		 .attr("id", e)
  		 .style("float", "left")
  		 .append("a")
  		 .attr("href", "javascript:changeYear(" + b.value + ")")
  		 .text(b.value)
  		 .on("mouseover", function () {return changeYear(this.innerHTML)});
    }
  	++d != a && c.append("span")
  				 .style("float", "left")
  				 .style("margin-left", "5px")
  				 .style("margin-right", "5px")
  				 .text(" | ");
  })
}
function changeYear(a) {
  currentYear = a;
	update()
}

/********************************FUNCIONES DEL MAPA************************************/
function mouseOverMap(a) {
	_selectedRegion == null && (regSelected = a.properties.ID, _overRegion = {}, _overRegion.data = a, _overRegion.ID = a.properties.ID, update())
};
function mouseOutMap(a) {
	_selectedRegion == null && (regSelected = null, _overRegion = null, update())
};
function clickMap(a) {
	_overRegion = null;
	_selectedRegion != null && _selectedRegion.ID == a.properties.ID ? (_selectedRegion = null, mouseOutMap(), update()) : (_selectedRegion = null, mouseOutMap(), _selectedRegion = {}, _selectedRegion.ID = a.properties.ID, _selectedRegion.data = a, regSelected = _selectedRegion.ID, update())
};
function refresh() {
  d3.selectAll("#states path").attr("d", function (a) {return path_proj(a)})
}
function updateColors() {
  var a = getMaxAndMinValues();
  var b = a.curMax;
  var c = a.curMin;
  var d = a.prop;
  var e = curRegDataset;
  getRegionColor = function (a, b, c, f, g) {
  	var h = parseInt(a.properties.ID);
    var j = e;
    if (j[h] != null) {
        _selectedFunctionID != null && j[h][_selectedFunctionID] == null && (j[h][_selectedFunctionID] = [], j[h][_selectedFunctionID][d] = 0, c = 0);
        var k = _selectedFunctionID == null ? j[h][d] : j[h][_selectedFunctionID][d];
        var l = k - c;
    }
    if (_selectedRegion != null && g == !1 && _selectedRegion.ID == h) return "#000000";
    if (_overRegion != null && _overRegion.ID == h && g == !1) return "#666";
    return interp(l / (f - c))
  };
    
	var f = d3.selectAll("#states path");
  if (_overRegion != null || prevItemRegion || _selectedRegion) {
      var g = _selectedRegion == null ? prevItemRegion == null ? _overRegion.ID : prevItemRegion : _selectedRegion.ID;
      f = d3.select("#states path.region_" + g)
  }
  _overRegion != null && _selectedRegion == null && (regOverColor = getRegionColor(_overRegion.data, _overRegion.ID, c, b, !0));
	_selectedRegion != null && (regOverColor = getRegionColor(_selectedRegion.data, _selectedRegion.ID, c, b, !0));
	
	f.transition(300).style("fill", function (a, d) {
    return getRegionColor(a, d, c, b, !1)
  });
	prevItemRegion != null ? prevItemRegion = null : prevItemRegion = g
}

function path_proj(a) {
  if (a.properties.ID <= 17) {
		path.projection(xy);
		return path(a);
	}
	else if (a.properties.ID ==18) {
		path.projection(xy2);
		return path(a);
	}
	else {
		path.projection(xy3);
		return path(a);
	}
}

/**************************************FUNCIONES DEL BARCHART**************************************************/
/* Creación del gráfico de barras, simplemente llamamos al updateBarChart*/
function createBarCharts() {
    updateBarChart()
}

function updateBarChart() {
  var a = regSelected;
  var b = regSelected == null ? balanceByYearByType[currentYear] : balanceByYearByRegionByType[currentYear][a];
  var c = d3.entries(b);
  var d = d3.max(c, function (a) {return a.value.value});
  var e = d3.min(c, function (a) {return a.value.value});
  var f = [];
  f.data = [];
	f.byYear = [];
  var g = [];
  g.data = [];
	g.byYear = [];
  var h = d3.entries(regSelected == null ? balanceByYearByType : balanceByYearByRegionByType);
  h.forEach(function (b) {
    if (b.key >= availableYears[0] && b.key <= availableYears[availableYears.length - 1]) {
      var c = d3.entries(regSelected == null ? b.value : b.value[a]);
      var d = d3.max(c, function (a) {return a.value.value});
  		var	e = d3.min(c, function (a) {return a.value.value});
      f.data.push(d);
  		f.byYear[b.key] = f.data.length - 1;
      g.data.push(e);
  		g.byYear[b.key] = g.data.length - 1
    }
  });
    
	var i = d3.max(f.data, function (a) {return a});
  j = d3.min(g.data, function (a) {return a});
  k = _useAbsoluteValues ? i : d,
  l = _useAbsoluteValues ? j : e,
  m = c.sort(function (a, b) {
    if (a.value.functionlabel == null || b.value.functionlabel == null) return 0;
    var c = a.value.functionlabel.toLowerCase(),
        d = b.value.functionlabel.toLowerCase();
    if (c < d) return -1;
    if (c > d) return 1;
    return 0
  });
        
	var	n = d3.selectAll("#functionsKey")
      			.selectAll("div.functionalArea")
      			.data(m);
        
	var	o = n.enter().append("div");
	o.attr("id", function (a, b) {return "barchart_" + a.value.functionID + "_text"})
		.attr("class", "functionalArea")
		.on("mouseover", function (a, b) {return mouseOverBarChart(a, b, !0)})
		.on("mouseout", function (a, b) {return mouseOutBarChart(a, b)})
		.on("click", function (a, b) {return clickBarChart(a, b)});
	o.append("div")
		.attr("id", function (a, b) {return "funcchart_" + a.value.functionID})
		.attr("class", "bar");
	o.append("div")
		.attr("class", "functional_label");
		
	d3.selectAll("#functionsKey div.functional_label")
		.data(m)
		.style("font-weight", function (a) {return a.value.functionID == _selectedFunctionID ? "bold" : "normal"})
		.style("color", function (a) {return a.value.functionID == _selectedFunctionID ? "#000000" : "#999999"})
		.text(function (a) {return a.value.functionlabel != null ? a.value.functionlabel : ""});
	
	d3.selectAll("#functionsKey div.bar")
		.data(m)
		.style("background-color", function (a) {return a.value.functionID == _selectedFunctionID ? "black" : "#cccccc"})
		.transition(300)
		.call(function (a) {
			var b = function (a) {return Math.max(1, (a.value.value - l) / k * 100)};
			a.style("width", function (a) {return b(a) + "px"});
			a.style("left", function (a) {return -5 - b(a) + "px"})
		});
		
	n.exit().remove();
}

function mouseOverBarChart(a, b, c) {
    _clickedFunction == null && selectFunction(a.value.functionID)
}
function mouseOutBarChart(a, b) {
    _clickedFunction == null && selectFunction(null)
}
function clickBarChart(a, b) {
    _clickedFunction == a.value.functionID ? _clickedFunction = null : _clickedFunction = a.value.functionID, selectFunction(_clickedFunction)
}
function selectFunction(a) {
  _selectedFunctionID = a; 
	update();
}

/***********************************FUNCIONES DEL INFOBOX*********************************************/
function showCountryInfo() {
  if (_selectedRegion == null) {
    d3.select("#infoTitle").text("España");
    var a = formatValueShort(currentMode == MODE_PER_PERSON ? calculateAverage() : getTotalCountryAmount());
    d3.select("#infoValue")
  		.style("font-size", a.length > 8 ? 70 : 40)
  		.html(a);
  	d3.select("#infoAvgBox")
  		.style("visibility", "hidden"); 
  	d3.select("#infobox")
  		.style("background-color", "#f0f0f0");
  	updateInfoDesc()
  }
}
function showRegionInfo(a) {
  var b = curRegDataset[a];
  if (b != null) {
    var c = _selectedFunctionID == null ? b : b[_selectedFunctionID];
    var d = getMaxAndMinValues(!1);
    var e = d.curMax;
    var f = d.curMin;
    var g = d.prop;
    var h = curRegDataset;
    var i = calculateAverage();
    var j = d3.scale.linear()
        		  .domain([f, i, e])
        		  .range([0, 50, 100]);
    var k = d3.scale.linear()
              .domain([0, i])
        		  .rangeRound([-100, 0]);
    var l = formatValueShort(c[g]);
		d3.select("#infoTitle")
		  .text(ccaaLabels[a]);
    d3.select("#infoValue")
		  .html(l);
		d3.select("#infoAvgBox")
		  .style("visibility", "visible");
		d3.select("#infoBar")
		  .transition(500)
		  .style("width", 190 * j(c[g]) / 100 + "px");
		
		l = k(c[g]);
		d3.select("#infoAvgText")
		  .text("sobre media país: " + (l > 0 ? "+" + l : l) + " % ");
		updateInfoDesc()
  }
  d3.select("#infobox")
	  .style("background-color", regOverColor)
	  .style("display", "")
}
/*Dependiendo de modo de visualización actual, modifica la etiqueta del infoBox*/
function updateInfoDesc() {
    d3.select("#infoDesc").text(currentMode == MODE_PER_PERSON ? "presupuesto por persona" : "presupuesto total")
}

/*********************************FUNCIONES DE CALCULO************************************************/
function getPopulationByYearByRegion(a, b) {
    return populationByRegionByYear[a].data[b].value
}
/*Suma los presupuestos de una determinada agrupación*/
function getTotalAmount(a) {
    var b = 0;
    a.forEach(function (a) {b += parseFloat(a.Total);});
    return b
}
/*Suma los valores de la población de cada región y devuelve el total.*/
function getTotal(a) {
    var b = 0;
    a.forEach(function (a) {b += parseInt(a.Total);});
    return b
}
function calculateAverage() {
  var a = 0;
  var b = 0;
  var c = populationByRegionByYear[currentYear].data;
  var d = curRegDataset;
  var e = _selectedFunctionID;
	var f = 0;
  a = getTotalCountryAmount();
  d3.entries(c).forEach(function (a) {
    b += a.value.value || 0;
  	f++;
  });
	currentMode == MODE_TOTAL && (b = f);
  return a / b
}
function getTotalCountryAmount() {
  var a = 0;
  var b = _selectedFunctionID;
  d3.entries(curRegDataset).forEach(function (c) {
    b ? a += c.value[b].value || 0 : a += c.value.value || 0
  });
  return a;
}
function getMaxAndMinValues(a) {
  var c = curRegDataset = _selectedFunctionID == null ? balanceByYearAndByRegion[currentYear] : balanceByYearByRegionByType[currentYear];
  var d = d3.entries(c);
  var e = currentMode;
  var f = e == MODE_PER_PERSON ? "valuePerPerson" : "value";
  var g = function (a) {
    _selectedFunctionID != null && a.value[_selectedFunctionID] == null && (a.value[_selectedFunctionID] = [], a.value[_selectedFunctionID][f] = 0);
    return _selectedFunctionID == null ? a.value[f] : a.value[_selectedFunctionID][f]
  };
  var h = _selectedFunctionID == null ? balanceByYearAndByRegion : balanceByYearByRegionByType;
  var i = d3.entries(h);
  var j = [];
  j.data = [];
  j.byYear = [];
  var k = [];
  k.data = []; 
  k.byYear = [];
  var l = 0;
  var m = 0;
    
	i.forEach(function (a) {
    if (a.key >= availableYears[0] && a.key <= availableYears[availableYears.length - 1]) {
      var b = d3.entries(a.value);
      var c = d3.max(b, function (a) {return g(a)});
      j.data.push(c), j.byYear[a.key] = j.data.length - 1;
      var d = d3.min(b, function (a) {return g(a)});
      k.data.push(d), k.byYear[a.key] = k.data.length - 1
    }
  });
	
	l = d3.max(j.data, function (a) {return a});
	m = d3.max(k.data, function (a) {return a});
    
	var n = d3.max(d, function (a) {return g(a)});
  var o = d3.min(d, function (a) {return g(a)});
  var p = a == null ? _useAbsoluteValues : a;
  var q = p ? l : n;
  var r = p ? m : o;
  return {curMax: q, curMin: r, prop: f}
}
/*Realizamos el calculo para YR y YRT por persona teniendo en cuenta el presupuesto total y la población asociada*/
function calculateDataPerPerson() {
  var a = d3.entries(balanceByYearAndByRegion);
  a.forEach(function (a, b) {
    if (a.key >= availableYears[0] && a.key <= availableYears[availableYears.length - 1]) {
      var c = d3.entries(a.value);
      c.forEach(function (b) {
        var c = a.key,
            e = b.key,
            f = b.value.value;
        balanceByYearAndByRegion[c][e].valuePerPerson = f / getPopulationByYearByRegion(c, e)
      })
    }
  });

  var a = d3.entries(balanceByYearByRegionByType);
  a.forEach(function (a, b) {
    var c = a.key;
    if (a.key >= availableYears[0] && a.key <= availableYears[availableYears.length - 1]) {
      var d = d3.entries(a.value);
      d.forEach(function (a) {
        var b = a.key,
            d = d3.entries(a.value),
            e = "";
        d.forEach(function (a) {
          var d = a.key,
              e = a.value.value;
          balanceByYearByRegionByType[c][b][d].valuePerPerson = e / getPopulationByYearByRegion(c, b)
        })
      })
    }
  })
}

/************************************FUNCIONES DE FORMATEO DE ENTRADA*******************************************/
/*Formatea y totaliza por comunidad */
function formatCensoData(a) {
  var b = {};
  b.label = a[0].Comunidad;
	b.ID = a[0].Idcomu;
	b.value = getTotal(a);
  return b
}
/*Formatea y totaliza por año y comunidad */
function formatBudgetDataYR(a) {
  var b = {};
  b.label = a[0].Comunidad;
	b.ID = a[0].Idcomu;
	b.value = getTotalAmount(a);
  return b
}
/*Formatea y totaliza por año y función*/
function formatBudgetDataYT(a) {
  var b = {};
	b.functionlabel = a[0].Funcion;
	b.functionID = a[0].Codigo;
	b.value = getTotalAmount(a);
  return b
}
/*Formatea y totaliza por año, comunidad y función */
function formatBudgetDataYRT(a) {
  var b = {};
  b.label = a[0].Comunidad;
	b.functionlabel = a[0].Funcion;
	b.functionID = a[0].Codigo;
	b.ID = a[0].Idcomu;
	b.value = getTotalAmount(a);
  return b
}

/************************************FUNCIONES DE FORMATEO DE SALIDA******************************************/
function formatValueShort(a) {
  var b = 1e3,
      c = 1e6,
      d = 1e9,
      e = "\u20ac",
      i = "",
      f = "0";
  if (a >= c) i = " mill", a = a / c;
  else {
      var g = a.toString().substring(0, h);
      a > b ? i = "" : a = Math.round(100 * a) / 100
  }
  var g = a.toString(),
      h = a.toString().indexOf(".");
  h > -1 && (g = a.toString().substring(0, h));
  f = g.substring(0, g.length - 3) + "." + g.substring(g.length - 3, g.length);
  a < b && (f = g + "," + a.toString().substring(h + 1, h + 3));
  return e + f + i
}

/******************************************VARIABLES GLOBALES**********************************************/
var kk = 11,
  	xy = d3.geo.mercator().translate([32 * kk, kk * 140]).scale(kk * 1e3);
  	path = d3.geo.path();
  	//proyección ceuta
  	var kk2 = 40;
  	xy2 = d3.geo.mercator().translate([19.6 * kk2, kk2 * 116.1]).scale(kk2 * 1e3);
  	//proyección melilla
  	var kk3 = 40;
  	xy3 = d3.geo.mercator().translate([14.6 * kk3, kk3 * 114.5]).scale(kk3 * 1e3);
					
    ccaaLabels = ["Todas","Andalucía", "Aragón", "Asturias", "Illes Balears",
			"Canarias","Cantabria","Castilla y León","Castilla La Mancha","Cataluña","Comunitat Valenciana",
			"Extremadura","Galicia","Madrid","Murcia","Navarra","País Vasco","La Rioja","Ceuta","Melilla"];
			
var curRegDataset, _useAbsoluteValues = !0;
    _selectedFunctionID = null;
    //interp = d3.interpolateRgb(d3.rgb(255, 207, 134), d3.rgb(43, 140, 190));
  	interp = d3.interpolateRgb(d3.rgb(254, 217, 118), d3.rgb(227, 26, 28));
    availableYears = [2006, 2007, 2008, 2009, 2010];
    _dataLoaded = !1;
    loadedData = 0;
    maxTotalData = availableYears.length;

var regSelected;
    balanceByYearAndByRegion = [];
    balanceByYearByType = [];
    balanceByYearByRegionByType = [];
    _geoData = {};
    MODE_PER_PERSON = "PER PERSON";
    MODE_TOTAL = "TOTAL";
    populationByRegionByYear = {};
	
/*Temporizador para la animación temporal*/
intervalID = null;
counter = 0;
updateYear = function () {
	counter >= availableYears.length - 1 && stopUpdate();
	changeYear(availableYears[counter]);
	counter++
};
startUpdate = function () {
	stopUpdate();
	counter = 0;
	intervalID = setInterval(updateYear, 1e3);
	updatePlayBtn();
}; 
stopUpdate = function () {
	clearInterval(intervalID); 
	intervalID = null;
	updatePlayBtn();
};

var prevItemRegion; 
_clickedFunction = null;
regOverColor = null;
_selectedRegion = null;
_overRegion = null;
	
start();