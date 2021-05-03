
			

			//Width and height (width adjusts based on view)
			function w_map() {
				if(screen.width <= mobilePhone_map) {
					var mobile_width = 100 + '%';
					return mobile_width;
				} else 
					return 700;
				}	
	
				var h_map = 400;
	
				//for wordpress
				var mobilePhone_map = 460;
				var mobilePhone = 600;
				  var mapChartX;
				 var mapChartY;
				  var mapChart = document.getElementById("map_myChart");
				  var domRect;
	
				mapChart.addEventListener('mousemove' , findCoordinates);
	
	 
				//Define map projection_map
				var projection_map = d3.geoAlbersUsa()
									   .translate([w_map()/2, h_map/2])
									   .scale([800]); //map size
	
				//Define path_map generator
				var path_map = d3.geoPath()
								 .projection(projection_map);
								 
				//Define quantize scale to sort data values into buckets of color
				var colorRed = d3.scaleQuantize()
									.domain([0.5,1])
									.range(["#f1dedb","#f1bab1","#ee9385","#EF3E23"]);
	
				var colorBlue = d3.scaleQuantize() //gray to blue
									.domain([0.5,1])
									.range(["#dbeff5","#aadae7","#6bd3f0","#00BFF3"]); 
	
	
	////////// Create Bar with Winner
	
				//Create SVG element
				var svgBar = d3.select("#map_myBarChart")
						  .append("svg")
						.attr("width", w_map())
						.attr("height", 100);
	
				//Load in wage_gap data
				d3.csv("ElectionMapResultsBar.csv", function(data){
					
					barData = data
					//converting measures 
					data.forEach(function(d) {
						d.Candidate = d.Candidate;
						d.PercentECWins= +d.PercentECWins;
						d.NumECWins= +d.NumECWins;
					});
	
					var BarColor = d3.scaleOrdinal()
						.domain(barData.columns.slice(1))
						.range(['#EF3E23','#00BFF3'])
	
					var BarWidth = d3.scaleLinear()
						.domain([0,538])
						.range([0,w_map()])
	
					var BarStart = d3.scaleOrdinal()
						.domain([0,1])
						.range([0,(w_map()/538)*268]) //268 manually entered (# of trump electoral votes) 
	
					svgBar.selectAll("bar")
					   .data(barData)
					   .enter()
					   .append("rect")
					   .attr("width",function(d){return BarWidth(d.NumECWins);})
					   .attr("height",15)
					   .attr("x",function(d){return BarStart(d.Candidate);})
					   .attr("y",80)
					   .attr("fill",function(d){
							   return BarColor(d.Candidate);
					   })
	
					//center 50/50 line
					svgBar.selectAll("reference")
					   .data(barData.filter(function(d){ return d.Candidate == "The Democratic nominee (Biden/Harris)"; }))
					   .enter()
					   .append("rect")
					   .attr("width",2)
					   .attr("height",60)
					   .attr("x",function(d){return BarWidth(269);})
					   .attr("y",75)
					   .attr("fill","black")
	
					//add Trump text   
					svgBar.selectAll("class","leftHeader")
						 .data(barData.filter(function(d){ return d.Candidate == "The Republican nominee (Trump/Pence)"; }))
						 .enter()
						 .append("text")
						 .attr("x",0)
						 .attr("y",30)
						 .text("TRUMP")
						 .style("fill","black")
						 .style("font-family","Arial Black")
						 .style("font-size",25)
	
					svgBar.selectAll("class","leftValue")
						 .data(barData.filter(function(d){ return d.Candidate == "The Republican nominee (Trump/Pence)"; }))
						 .enter()
						 .append("text")
						 .attr("x",0)
						 .attr("y",75)
						 .text(function(d){return d.NumECWins})
						 .style("fill","#EF3E23")
						 .style("font-family","Arial Black")
						 .style("font-size",45)
	
					//add Biden text   
					svgBar.selectAll("class","rightHeader")
						 .data(barData.filter(function(d){ return d.Candidate == "The Democratic nominee (Biden/Harris)"; }))
						 .enter()
						 .append("text")
						 .attr("x",610)
						 .attr("y",30)
						 .text("BIDEN")
						 .style("fill","black")
						 .style("font-family","Arial Black")
						 .style("font-size",25)
	
					svgBar.selectAll("class","rightValue")
						 .data(barData.filter(function(d){ return d.Candidate == "The Democratic nominee (Biden/Harris)"; }))
						 .enter()
						 .append("text")
						 .attr("x",610)
						 .attr("y",75)
						 .text(function(d){return d.NumECWins})
						 .style("fill","#00BFF3")
						 .style("font-family","Arial Black")
						 .style("font-size",45)
	
				});		
	
	
	////////// Create Map
	
				//Create SVG element
				var svgMap = d3.select("#map_myChart")
						  .append("svg")
						.attr("width", w_map())
						.attr("height", h_map);
	
				//Load in wage_gap data
				d3.csv("ElectionMapData.csv", function(data){
	
				
					//converting measures 
					data.forEach(function(d) {
						d.State = d.State;
						d.SimpleCanidate = d.SimpleCanidate;
						d.CanidateFavored = d.CanidateFavored;
						d.WinFlag = +d.WinFlag;
						d.PercentECWinsFavored = +d.PercentECWinsFavored;
						d.ElectoralVotes = +d.ElectoralVotes;
					});
	
					//Load in GeoJSON data
					d3.json("us-states.json",function(json) {
	
						//Merge the ag. data and GeoJSON
						//Loop through once for each ag. data value
						for (var i = 0; i < data.length; i++) {
					
							var dataState = data[i].State;
							var dataCanidate = data[i].SimpleCanidate;
							var dataValue = parseFloat(data[i].PercentECWinsFavored);
							var dataWin = parseFloat(data[i].WinFlag);
							var dataVotes = parseFloat(data[i].ElectoralVotes);
	
							for (var j = 0; j < json.features.length; j++) {
							
								var jsonState = json.features[j].properties.name;
					
								if (dataState == jsonState) {
							
									//Copy the data value into the JSON
									json.features[j].properties.PercentECWinsFavored = dataValue;
									json.features[j].properties.state = dataState;
									json.features[j].properties.SimpleCanidate = dataCanidate;
									json.features[j].properties.WinFlag = dataWin;
									json.features[j].properties.ElectoralVotes = dataVotes;
									
									break;
									
								}
							}		
						}
	
						//Bind data and create one path_map per GeoJSON feature
						svgMap.selectAll("path_map")
						   .data(json.features)
						   .enter()
						   .append("path")
						   .attr("d", path_map)
						   .style("stroke", "#fff")
						   .style("stroke-width", "1.25")
						   .style("fill", function(d){
								   if (d.properties.WinFlag) { //if flag = 0, then...
									   return colorRed(d.properties.PercentECWinsFavored);
	
								   } else {
									   return colorBlue(d.properties.PercentECWinsFavored);
								   }
						   })
							.on("mouseover", function(d) {
							
								//if/else for excluding tooltip on mobile
								if(screen.width <= mobilePhone) {
									//no tooltip for mobile
								}
								else {
								
									//create format function for value tooltip
									var formatComma = d3.format(",");
	
									//determine Map_tooltip title
									d3.select("#Map_tooltip")
										.style("left", calculatePositionX() + "px")		
										.style("top", (mapChartY + (domRect.top * -1)) + "px")
										.select("#Map_tooltipTitle")
											.text(d.properties.state)
	
									//determine Map_tooltip Value
									   d3.select("#Map_tooltip")
										.style("left", calculatePositionX() + "px")		
										.style("top", (mapChartY + (domRect.top * -1)) + "px")
										.select("#value")
										.text(d.properties.SimpleCanidate + " won " + formatComma(d.properties.PercentECWinsFavored*100) + "% of simulations")
	
									//how many eletoral votes in state
									d3.select("#Map_tooltip")
										.style("left", calculatePositionX() + "px")		
										.style("top", (mapChartY + (domRect.top * -1)) + "px")
										.select("#Map_tooltipVotes")
											.text(d.properties.ElectoralVotes + " Electoral Votes")
									//Show the Map_tooltip
									d3.select("#Map_tooltip").classed("hidden", false);
	
								}
							})
							.on("mouseout", function() {
								//Hide the Map_tooltip
								if(screen.width <= mobilePhone) {
									//no tooltip for mobile
								}
								else {
									d3.select("#Map_tooltip").classed("hidden", true);
								}
							})
	
					}); //end of map json 
	
				}); //end of map csv
	
	
		//functions for wordpress
			function screenCheckerMap() {
				if(screen.width <= mobilePhone_map) {
					var mobile_width = 100 + '%';
					return mobile_width
				} else 
					return w_map()
			}
	
			 function screenCheckerBar() {
	
				if(screen.width <= mobilePhone_map) {
					return 10
				} else 
				return (w_map()/2)/2
			}
	
			function findCoordinates(event) {
			  mapChartX = event.clientX;
			  mapChartY = event.clientY;
			  domRect = mapChart.getBoundingClientRect();
			 }
	
			function calculatePositionX() {
				var xPosition =  (window.innerWidth - mapChart.offsetWidth)  / 2;
				xPosition = mapChartX - xPosition;
	
				if(xPosition <= 0) {
					xPosition = xPosition * (-1);
					return xPosition;
				} else 
				return xPosition;
			}