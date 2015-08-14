//
// Controller to load statistics
// from the Funnel Stats service.
//
// sparklines.js

// function to generate time-series
// sparklines using an API endpoint from
// HDX. this function depends on:
// -- c3.js
// -- d3.js

app.controller('DataStoreController', ['$http', 'ngProgressFactory', function ($http, ngProgressFactory) {
  var self = this
  self.submit = function () {
    self.progressbar = ngProgressFactory.createInstance()
    self.progressbar.start()
    $http.get('/api/datastore/create/' + this.resourceid)
    .then(
      function (response) {
        self.progressbar.complete()
        self.message = response.data.message
        if (response.data.success) {
          self.success = true
          self.failure = false
        } else {
          self.success = false
          self.failure = true
        }
        console.log(response.data)
      },
      function (response) {
        self.progressbar.complete()
        self.failure = true
        self.success = false
        self.message = 'Service not available.'
        console.log(response.data)
      })
  }
}])

function generateSparkline(data_source, div_id, verbose, use_ratio) {

  var div_id = '#' + div_id

  function formatRatios(d, a) {
      if (a)
        return d3.format('%')(d)
      else
        return d
  }

  d3.json(data_source, function(error, json) {
    if (error) return console.warn(error);

    // filtering data
    var data = []
    FilterData = function(d) {
      record = {'period': d.period_start_date, 'value': d.value}
      data.push(record) 
    }

    json['resources'].forEach(FilterData)
    
    // Filtering data based on date.
    data = new DataCollection(data)
      .query()
      .sort('period', false)
      .filter({
        period__gte: '2014-07-01'
      })
      .values();

    if (verbose) console.log(data);

    c3.generate({
      bindto: div_id,
      data: {
        x: 'period',
        x_format : '%Y-%W',
        json: data,
        keys:{
          value: ['period', 'value'],
        },
        labels: false,
        selection: {
          enabled: false,
          grouped: false,
          multiple: false,
        },
        type: 'spline'
      },
      point: {
        show: false
      },
      legend: {
        show: false
      },
      color: { pattern: [ "#9A57BD" ] },
      size: {
          height: 100
      },
      tooltip: {
        format: {
          value: function(d) { return formatRatios(d, use_ratio) }
        }

      },
      axis : {
        x : {
          show: false,
          type : 'timeseries',
          tick : {
            format : "Week of %B %e, %Y"
          }
        },
        y: {
          show: false
        }
      },
      grid: {

        // Notes overlayed in every graphic.
        x: {
          // lines: [
          //       { value: '2014-07-15', text: 'HDX Launch' },
          //       { value: '2014-11-13', text: 'Ebola Page' },
          //       { value: '2015-04-25', text: 'Nepal Earthquake' }
          //   ]
        }
      }
    });

  });
}

// Function to generate metadata from
// by pulling data from the statistics API.
function generateMetadata(data_source, div_id, verbose) {
  if (verbose) console.log(data_source)
  d3.json(data_source, function(err, data) {
    if (err) return console.warn(err)

    if (verbose) console.log(data)
    var container_id = div_id + '-title'
    document.getElementById(container_id).innerHTML = '<h2>' + data.resources[0].name + '</h2>' 
                                                      //+ '<h4>'
                                                      //+ data.resources[0].description
                                                      //+ '</h4>'
  })
}


// Function to generate the container
// for the upcoming visualizations.
function generateContainer(div_id, metricid) {
  var html = '<!-- Chart -->'
     + '<div class="col-md-3 tile">'
     + '<div id="' + metricid + '-title"></div>'
     + '<div id="' + metricid + '">'
     + '</div>'

  document.getElementById(div_id).innerHTML += html
}

// generating sparklines
// each function calls the api endpoint
// from a resource independently.
// this causes a performance issue,
// but demonstrates how each call can be made independendtly.
function GenerateGraphics(verbose) {
  var metricids = [
        'ckan-number-of-users',
        'ckan-number-of-datasets',
        'ckan-number-of-orgs',
        'ga-users',
        'ga-uniqueevents-resource-download',
        'ga-uniqueevents-resource-share',
        'ga-uniqueevents-dataset-share',
        'ga-avgsession-duration',
        'calc-ckan-new-users',
        'calc-conversion-register',
        'calc-conversion-download',
        'calc-uniqueevents-total-share',
        'calc-conversion-share',
        'calc-ckan-new-orgs',
        'calc-number-of-new-datasets'
        ]

  for (i = 0; i < metricids.length; i++) {

    // Variables used for fetching
    // data from the our statistics API.
    // If value is weekly, have to change the
    // data parsing type in the C3.js function.
    var is_ratio = false
    var metricid = metricids[i]
    var metricid_ratios = ['calc-conversion-register', 'calc-conversion-download', 'calc-conversion-share']
    var period_type = 'w'
    var data_url = '/api/funnel_stats/funnels?metricid=' + metricid + '&period_type=' + period_type
    var metadata_url = '/api/funnel_stats/metrics?metricid=' + metricid

    // Check if it is a ratio representation.
    for (j = 0; j < metricid_ratios.length; j++) {
      if (metricid == metricid_ratios[j]) {
        if (verbose)
          console.log('This metricid is a ratio: ' + metricid_ratios[j])
        
        is_ratio = true
      }
    }

    // Calls the sparkline generating function.
    generateContainer('tile-container', metricid, false)
    generateSparkline(data_url, metricid, false, is_ratio)
    generateMetadata(metadata_url, metricid, false)

  }
}

// Generating all graphics.
GenerateGraphics()