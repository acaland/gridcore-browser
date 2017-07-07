

var access_token = null;
RPCManager.allowCrossDomainCalls = true;
// Canvas.resizeControls(5);
Canvas.resizeFonts(3);

function login(_callback) {
	var data = JSON.stringify({ username: "gridcore", password: "gr1dc0re"});
    isc.RPCManager.sendRequest({
		data: data,
		useSimpleHttp: true,
		contentType: "application/json",
		actionURL: "https://glibrary.ct.infn.it:3500/v2/users/login",
		callback: function (response, data) {
            
			if (response.status != 0) {
				console.log(response.data.response.data);
				response.errors = response.data.response.data;
				_callback({success: false});
				return;
			}
			access_token = JSON.parse(data).id;
			console.log("Access Token:", JSON.parse(data).id);
			//quelleDS.requestProperties.httpHeaders["Authorization"] = access_token;
			//console.log(todolistDS.requestProperties.httpHeaders);
			if (_callback) {
				_callback({success: true});
			}
		}
	});
}

if (!access_token) {
	login(function(e) {
		if (e.success) {
            console.log("Login successful");
            // load data now
            resultsBrowser.fetchData();
		} else {
            console.log("Something went wrong")
        }
	})
} else {
	// load data now
}




isc.DataSource.create({
    ID: "userIDlist",
    dataURL: "https://glibrary.ct.infn.it:3500/v2/repos/gridcore/tabcog?filter[fields][user:uid]=true&include_count=true",
    requestProperties: {
		httpHeaders: {
			"content-type": "application/json"
		}
	},
    transformRequest: function(dsRequest) {
		dsRequest.httpHeaders["Authorization"] = access_token;
    },
    transformResponse: function(dsResponse, dsRequest, data) {
		dsResponse.data = _.uniq(data.data, function(id) { return id["user:uid"] });
        dsResponse.totalRows = dsResponse.data.length;
        console.log(dsResponse.totalRows);
	},
    dataFormat: "json",
    fields: [ 
        { name: 'user:uid', title: "ID Utente", width: 100 }
    ]
});


isc.DataSource.create({
	ID: "testResultsDS",
	//total: 500,
	dataURL: "https://glibrary.ct.infn.it:3500/v2/repos/gridcore/tabcog",
	//preventHTTPCaching: false,
    
	requestProperties: {
		httpHeaders: {
			"content-type": "application/json",
		}
	},
	transformRequest: function(dsRequest) {
		// var params = {
            // 	start : dsRequest.startRow,
            //   end : dsRequest.endRow
            // };
            
            dsRequest.httpHeaders["Authorization"] = access_token;
            // console.log("dataPageSize", dsRequest.dataPageSize);
            if (dsRequest.dataPageSize) {
                dsRequest.actionURL = this.dataURL + "?filter[limit]=" + dsRequest.dataPageSize + "&filter[skip]=" + dsRequest.startRow + "&include_count=true";
            } else {
                dsRequest.actionURL = this.dataURL + "?include_count=true"
            }
            // console.log("operation type", dsRequest.operationType);
            // console.log("dsRequest.data", dsRequest.data);
            // console.log("carico dati, trasformo richiesta");
			// console.log("dsRequest", dsRequest.resultSet);
            
            // console.log("criteria", dsRequest.resultSet.getCriteria());
            console.log("criteria", dsRequest.data);
            // var criteria = dsRequest.resultSet.getCriteria();
            var criteria = null;
            if (dsRequest.operationType == "fetch") {
                criteria = dsRequest.data;
            } else {
                criteria = dsRequest.resultSet.getCriteria();
            }

            // var criteria = {titel: "Material", autor: "Eugen"};
            var where = "";
            if (criteria) {
                for (var key in criteria) {
                    // where = where + "&filter[where][" + key + "][like]=%25" + encodeURIComponent(criteria[key]) + "%25";
                    if (key == "dateRange") {
                        var startDate = new Date(criteria["dateRange"].start).toISOString().substr(0,10).replace(/-/g, "");
                        var endDate = new Date(criteria["dateRange"].end).toISOString().substr(0,10).replace(/-/g, "");
                        where = where + "&filter[where][user:tt][between][0]=" + startDate + "&filter[where][user:tt][between][1]=" + endDate;
                    } else {
                        where = where + "&filter[where][" + key + "]=" + encodeURIComponent(criteria[key]);
                    }
                    
                }
                dsRequest.actionURL = dsRequest.actionURL + where;
            } 
            //console.log(where);
            console.log(dsRequest.actionURL);
            //return dsRequest.data;
        },
        transformResponse: function(dsResponse, dsRequest, data) {
            // console.log(data);
            dsResponse.totalRows = data.total;
            dsResponse.data = data.data;
            // 	this.fields = [{ name: 'id', type: 'integer', hidden: true },
            //   { name: 'tmphash' },
            //   { name: 'gesamtwerkId', type: 'integer' }];
            
            // console.log('dsResponse', dsResponse);
        },
        
        dataFormat: "json",
        fields: [
        
        { name: 'user:uid', title: "ID Paziente", width: 100 },
        { name: 'user:tt', align: "left", title: "Date", width: 150, type: "date", formatCellValue: function (value) {
            // console.log(value);
            if (value) {
                var year = value.substr(0, 4);
                var month = value.substr(4, 2);
                var day = value.substr(6, 2);
                var hour = value.substr(9, 2);
                var minutes = value.substr(11, 2);
                var seconds = value.substr(13, 2);
                return day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;
            }
            
        }
    },
    
    
    { name: 'user:accT1', title: "ACC" },
    { name: 'user:tmrT1', title: "TMR" },
    { name: 'user:vtmT1', title: "VTM" },
    
    { name: 'user:accT2', title: "ACC" },
    { name: 'user:tmrT2', title: "TMR" },
    { name: 'user:vtmT2', title: "VTM" },
    
    { name: 'user:accT3', title: "ACC" },
    { name: 'user:tmrT3', title: "TMR" },
    { name: 'user:vtmT3', title: "VTM" },
    
    { name: 'user:accT4', title: "ACC" },
    { name: 'user:tmrT4', title: "TMR" },
    { name: 'user:vtmT4', title: "VTM" },
    
    { name: 'user:accT5', title: "ACC" },
    { name: 'user:tmrT5', title: "TMR" },
    { name: 'user:vtmT5', title: "VTM" },
    
    { name: 'user:accT6', title: "ACCc" },
    { name: 'user:aciT6', title: "ACCi" },
    { name: 'user:tmrT6', title: "TMRc" },
    { name: 'user:tmiT6', title: "TMRi" },
    { name: 'user:vtmT6', title: "VTMc" },
    { name: 'user:vtiT6', title: "VTMi" },
    
    { name: 'user:accT7', title: "ACC" },
    { name: 'user:tmrT7', title: "TMR" },
    { name: 'user:vtmT7', title: "VTM" },
    
    { name: 'user:accT8', title: "ACC" },
    { name: 'user:tmrT8', title: "TMR" },
    { name: 'user:vtmT8', title: "VTM" },
    
    
    
    // { name: 'id', type: 'integer', detail: true },
    // { name: 'tmphash', detail: true },
    // { name: 'gesamtwerkId', type: 'integer', detail: true },
    // { name: 'typId', type: 'integer', detail: true },
    // { name: 'veroeffentlicht', type: 'integer', detail: true },
    // { name: 'titel', autoFitWidth: true },
    // { name: 'autor', autoFitWidth: true },
    // { name: 'untertitel', autoFitWidth: true  },
    // { name: 'bandtitel' },
    // { name: 'baende', type: 'integer' },
    // { name: 'band' },
    // { name: 'reihentitel',  autoFitWidth: true  },
    // { name: 'reihennummer' },
    // { name: 'auflage' },
    // { name: 'nachdruck', detail: true },
    // { name: 'erscheinungsort', detail: true },
    // { name: 'erscheinungsjahr', type: 'integer', detail: true },
    // { name: 'erstauflage', detail: true },
    // { name: 'erscheinungszeitvon', type: 'integer', detail: true },
    // { name: 'erscheinungszeitbis', type: 'integer', detail: true },
    // { name: 'verlag', detail: true },
    // { name: 'isbn', detail: true },
    // { name: 'seiten', type: 'integer', detail: true },
    // { name: 'seitenvonbis', detail: true },
    // { name: 'seitenstruktur', detail: true },
    // { name: 'hyperlink', detail: true },
    // { name: 'hyperlinkDatum', type: 'datetime', detail: true },
    // { name: 'exzerpiert', type: 'integer', detail: true },
    // { name: 'belegmaterial', type: 'integer', detail: true },
    // { name: 'bezugszeitraum', detail: true },
    
    // { name: 'bearbeiter' },
    // { name: 'herausgeber' },
    // { name: 'herausgeberreihe' },
    // { name: 'kurzzitat' },
    // { name: 'kurzzitatSort' },
    // { name: 'langzitat' },
    // { name: 'verweiszitat', detail: true },
    // { name: 'zitatseite', type: 'integer', detail: true },
    // { name: 'zitatspalte', type: 'integer', detail: true },
    // { name: 'zitatversion', type: 'integer', detail: true },
    // { name: 'zitatohneseite', type: 'integer', detail: true },
    // { name: 'zitatjahr', type: 'integer', detail: true },
    // { name: 'zitatjahrgang', type: 'integer', detail: true },
    // { name: 'zitatband', type: 'integer', detail: true },
    // { name: 'klassifikation', detail: true },
    // { name: 'originaldaten', detail: true },
    // { name: 'freigabe', type: 'integer', detail: true },
    // { name: 'checked', type: 'integer', detail: true },
    // { name: 'wordleiste', type: 'integer', detail: true },
    // { name: 'druck', type: 'integer', detail: true },
    // { name: 'online', type: 'integer', detail: true },
    // { name: 'publiziert', type: 'integer', detail: true },
    // { name: 'anmerkung', detail: true },
    // { name: 'zugeordnet', type: 'integer', detail: true }
	]
});


isc.SearchForm.create({
    ID:"findForm",
    autoDraw:false,
    dataSource:"userIDlist",
    // titleOrientation: "top",
    // left:0,
    // top:0,
    // height: 60,
    // width: 340,
    // width: "50%",
    // width: "60%",
    // membersMargin: 20,
    cellPadding:10,
    // border: "1px dashed blue",
    // align: "left",
    numCols:4,
    // colWidths: [100, 200, 100, 100],
    // border:"1px solid blue",
    fields:[
    
        {name:"user:uid", title: "ID Paziente", editorType:"comboBox", optionDataSource:"userIDlist", width: 200,
        pickListWidth:200, cellHeight: 80, value: 'babiloni'},
        // {name: "scegli", title: "boh", type: "date", useTextField: false,  wrapTitle:false},
        {name:"dateRange", title: "Date Range", type:"date", dateFormatter: "toEuropeanShortDate", 
            value: { start: new Date("01/01/2015"), end: new Date("12/31/2015")}
         }
    // {name:"startDate", title:"End Date", type:"date",wrapTitle:false},
    // {name:"findInCategory", editorType:"checkbox", 
    //     title:"Use category", defaultValue:true, shouldSaveValue:false},
    ]
}); 

isc.Button.create({
    ID: "findButton",
    autoDraw: false,
    title: "Cerca dati",
    width:100,
    height: 40,
    // border: "1px dashed blue",
    left: 20,
    // backgroundColor: "red",
    align: "center",
    click: function() {
        console.log("Values: ", findForm.getValues());
        resultsBrowser.filterData(findForm.getValues());
    }
});





isc.ListGrid.create({
	ID: "resultsBrowser",
	left: 10,
	top: 50,
    
	dataSource: "testResultsDS",
	autoFetchData: false,
	canEdit: false,
	dataPageSize: 100,
    headerHeight: 44,
	// showFilterEditor: true,
    autoDraw: false,
    showResizeBar: true,
    alternateRecordStyles: true,
    selectionType:"single",
    // fields: [
    //     {name: "user:tt", width: 150}
    // ],
    headerSpans: [
    {
        fields: ["user:accT1", "user:tmrT1", "user:vtmT1"],
        title: "Task 1"
    },
    {
        fields: ["user:accT2", "user:tmrT2", "user:vtmT2"],
        title: "Task 2"
    },
    {
        fields: ["user:accT3", "user:tmrT3", "user:vtmT3"],
        title: "Task 3"
    },
    {
        fields: ["user:accT4", "user:tmrT4", "user:vtmT4"],
        title: "Task 4"
    },
    {
        fields: ["user:accT5", "user:tmrT5", "user:vtmT5"],
        title: "Task 5"
    },
    {
        fields: ["user:accT6", "user:aciT6", "user:tmrT6", "user:tmiT6", "user:vtmT6", "user:vtiT6"],
        title: "Task 6"
        
    },
    {
        fields: ["user:accT7", "user:tmrT7", "user:vtmT7"],
        title: "Task 7"
    },
    {
        fields: ["user:accT8", "user:tmrT8", "user:vtmT8"],
        title: "Task 8"
    }
    
    ]
	//headerContextMenu: true
	//filterOnKeypress: true,
	//allowFilterOperators: true
    /* recordClick: function() {
        var record = this.getSelectedRecord();
        detailView.setData(record);
		console.log("selected record-> ", record.id);
		getAssociatedAsset(record.id, function(assets) {
			if (assets) {
				//console.log(asset);
				asset_list.setData(assets);
				showAllBtn.setDisabled(false);
			} else {
				getRelatedMultimediaList(record.id);
				showAllBtn.setDisabled(true);
			}
		});
		
    }*/
});

// isc.Canvas.create({
//     ID: "chartPaneTask1",
//     // top: 250, left: 220,
//     autoDraw: true,
//     // backgroundColor: 'green',
//     contents: "<div class='ct-chart1'></div>",
//     // selectContentOnSelectAll: true
// })


isc.TabSet.create({
    ID: "graficiTabSet",
    autoDraw: false,
    tabBarPosition: "top",
    // height: "100%",
    // height: "40%",
    tabSelected: function(tabNum, tabPane, ID, tab, name) {

        console.log("tab " + parseInt(tabNum + 1), "selected");
        if (currentData.length > 1) {
            console.log("buildchart for task:", tabNum + 1);
            setTimeout(function() {
                buildChart(tabNum + 1);
            }, 100);
            
        }
        // 
    },
    tabs: [
        {title: "Task 1", pane: isc.Canvas.create({ contents: "<div id='t1' class='ct-chart'></div>" }) },
        {title: "Task 2", pane: isc.Canvas.create({ contents: "<div id='t2' class='ct-chart'></div>" }) },
        {title: "Task 3", pane: isc.Canvas.create({ contents: "<div id='t3' class='ct-chart'></div>" }) },
        {title: "Task 4", pane: isc.Canvas.create({ contents: "<div id='t4' class='ct-chart'></div>" }) },
        {title: "Task 5", pane: isc.Canvas.create({ contents: "<div id='t5' class='ct-chart'></div>" }) },
        {title: "Task 6", pane: isc.Canvas.create({ contents: "<div id='t6' class='ct-chart'></div>" }) },
        {title: "Task 7", pane: isc.Canvas.create({ contents: "<div id='t7' class='ct-chart'></div>" }) },
        {title: "Task 8", pane: isc.Canvas.create({ contents: "<div id='t8' class='ct-chart'></div>" }) },
    ]
});


// var Singleton = {};
// Singleton.data = {
//     // A labels array that can contain any sort of values
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
//     // Our series array that contains series objects or in this case series data arrays
//     series: [
//         [5, 2, 4, 2, 0]
//     ]
// };




function calculateMedieSettimanali(startDate, endDate, taskNumber) {
        
    
        // var settimanaFinale = endDate;
        //alert(settimanaFinale);
        // var numeroSettimane = this.refs.numeroSettimane.value;
        // if (!numeroSettimane) {
        //     numeroSettimane = 9;
        // }
        
        var settimanaIniziale = moment(startDate).weekday(0).format("YYYYMMDD");
        var settimanaFinale = moment(endDate).weekday(6).format("YYYYMMDD");
        // console.log(settimanaIniziale, settimanaFinale);
        // var settimanaIniziale = moment(settimanaFinale, "YYYYMMDD").subtract(numeroSettimane, 'weeks').format("YYYYMMDD");
        // settimanaFinale =  moment(settimanaFinale, "YYYYMMDD").subtract(1, 'day').format("YYYYMMDD");
        //var settimanaIniziale = settimanaIniziale.format("YYYYMMDD")
        var numeroSettimane = Math.round(moment(settimanaFinale).diff(moment(settimanaIniziale), 'week', true));
        console.log("Settimana iniziale", settimanaIniziale, "settimana finale", settimanaFinale, "numero settimane", numeroSettimane);
        
        // var url = "http://glibrary.ct.infn.it/django/glib/gridcore/Entries/Tracciati/?limit=400&filter[0][field]=tt&filter[0][data][type]=numeric&filter[0][data][comparison]=gt&filter[0][data][value]=" + settimanaIniziale + "&filter[1][field]=tt&filter[1][data][type]=numeric&filter[1][data][comparison]=lt&filter[1][data][value]=" + settimanaFinale;
        // $.get(url, function(data) {
            // var results = JSON.parse(data).records;
        var results = currentData;
        var inizialWeekNumber = moment(settimanaIniziale, "YYYYMMDD").week();
        console.log("inizial week number:", inizialWeekNumber);
        var w = [];
        for (var i = 0; i <= numeroSettimane; i++) {
            w[i] = [];
        }
        for (var i = 0; i < results.length; i++) {   
            var currentWeekNumber = moment(results[i]["user:tt"].split("_")[0], "YYYYMMDD").week();
        
            if (results[i]["user:accT" + taskNumber]) {
                w[currentWeekNumber-inizialWeekNumber].push(results[i]["user:accT" + taskNumber])
            }
        }
        console.log("w:", w);
        var medieSettimanali = [];
        for (var i = 0; i <= numeroSettimane; i++) {
            medieSettimanali[i] = 0;
            for (var j = 0; j < w[i].length; j++) {
                medieSettimanali[i] += parseInt(w[i][j]);
            }
            if (w[i].length) {
                medieSettimanali[i] = Math.round(medieSettimanali[i] / w[i].length);
            }
            
        }
        console.log("medie settimanali", medieSettimanali);
        return medieSettimanali;
            //console.log(w);
            //console.log(medieSettimanali);
            // _callback({
            //     data: medieSettimanali, 
            //     periodo: "Dal " + moment(settimanaIniziale, "YYYYMMDD").format("LL") + " al " + moment(settimanaFinale, "YYYYMMDD").format("LL"),
            //     // settimaneValRif: this.refs.settimaneValRif ? this.refs.settimaneValRif .value: 0,
            //     // isValRifVisible: this.refs.isValRifVisible.checked
            // });
        // });
};


function buildChart(taskNum) {

    // var userId = findForm.getValues()["user:uid"];
    var startDate = findForm.getValues().dateRange.start;
    var endDate = findForm.getValues().dateRange.end;
    console.log(startDate, endDate);
    var numOfWeekForValoreDiRif = parseInt(refWeeksForm.getValues().numOfRefWeeks);
    var isValoreDiRiferimentoVisible = refWeeksForm.getValues().isValoreDiRiferimento;
    
    var medie = calculateMedieSettimanali(startDate, endDate, taskNum) //function(result) {
    var valoreDiRiferimento = 0;
        
    if (isValoreDiRiferimentoVisible && numOfWeekForValoreDiRif) {
        for (var i = 0; i < numOfWeekForValoreDiRif; i++) {
            valoreDiRiferimento += medie[i]
        }
        valoreDiRiferimento = Math.round(valoreDiRiferimento / numOfWeekForValoreDiRif);
    }
        
        // if (numOfWeekForValoreDiRif) {
        //     var valoreDiRiferimento = Math.round(valoreDiRiferimento / numOfWeekForValoreDiRif);
        // }
    console.log("valore di riferimento: " + valoreDiRiferimento);
        
    var data = {
        labels: new Array(medie.length).join().split(',').map(function(i, index) {return ++index + ""}),
        series: [{
            name: 'series-1',
            data: medie
        }]
    };
    if (isValoreDiRiferimentoVisible) {
        data.series.push({
            name: 'series-2',
            data: new Array(medie.length).join().split(',').map(function(i, index) {return valoreDiRiferimento+""})
        });
    }

    var options = {
        fullWidth: true,
        axisY: {
            onlyInteger: true,
        },
        // chartPadding: {
        //     left: 80
        // },
        labelOffset: 50,
        // width: 800,
        width: '100%',
        height: 250,
        series: {
            'series-1': {
                lineSmooth: false
            },
            'series-2': {
                    showPoint: false,
                    lineSmooth: false
            }
        }
    };
    console.log("Generating chart for task #t" + taskNum);
    new Chartist.Line('#t' + taskNum, data, options); //{width: '100%', height: '250px'});
    // });
}

var currentData = [];

isc.IButton.create({
    ID: "buildChartsButton",
    title: "Genera grafici",
    padding: 10,
    height: 40,
    autoDraw: false,
    click: function() {
        testResultsDS.fetchData(findForm.getValues(), function(resp, data) {
           // console.log(data) 
           currentData = data;
        //    console.log(graficiTabSet.selectedTab);
           buildChart(1);
        });
    }
});

isc.IButton.create({
    ID: "downloadCSV",
    title: "Export CSV",
    padding: 10,
    height: 40,
    autoDraw: false,
    click: function() {
        if (currentData.length > 0) {
             
            var csvData = new Blob([Papa.unparse(currentData)], {type: 'text/csv;charset=utf-8;'});
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(csvData);
            link.setAttribute('download', "tabcog.csv");
            document.body.appendChild(link);    
            link.click();
            document.body.removeChild(link);
        }
    }
})

isc.DynamicForm.create({
    ID: "refWeeksForm",
    titleOrientation: "top",
    // border: "1px dashed blue",
    numCols: 1,
    // membersMargin: 10,
    fields: [
        {name: "numOfRefWeeks", title: "Numero di settimane del valore di riferimento", type: "text", value: 1},
        {name: "isValoreDiRiferimento", title: "Mostra valore di riferimento", type: "checkbox"}
    ]
});



isc.VLayout.create({
    ID: "mainView",
    autoDraw: true,
    width: "100%",
    height: "100%",
    showResizeBar: true,
    members: [
        isc.HLayout.create({
            autoDraw:false,
            width: "80%",
            height: 60,
            align: "center",
            defaultLayoutAlign: "center",
            layoutMargin:10,
            membersMargin: 20,
            members:[findForm, findButton, refWeeksForm, buildChartsButton, downloadCSV]
        }), 
        resultsBrowser,
        graficiTabSet
    ]
});