//
// Generate a time-series chart based on a station
// id and a date.
//
// Author: Luis Capelo | luiscape@gmail.com
//

function CreateSparkLike(station_id) {

    //
    // Two parameters to fetch data: station id and date.
    //
    var base_url = 'http://localhost:2368/'
    var today = moment().subtract(11, 'days').format('YYYY-MM-DD')
    var api_query = base_url + 'api/metrics?id=' + station_id + '&day=' + today

    //
    // Fetch data from the processed data endpoint.
    //
    d3.json(api_query, function(data) {

        var graph_data = data['resources']

        //
        // Parse data into a datetime object.
        //
        parseDate = d3.time.format("%Y-%m-%d %H:%M").parse
        graph_data.forEach(function(item) {
            item['executionTime'] = parseDate(item['executionTime'])
        })

        //
        // Adding annotations.
        //
        var markers = [{
            'executionTime': moment().subtract(11, 'days'),
            'label': 'Now'
        }];

        //
        // Create chart.
        //
        MG.data_graphic({
            data: graph_data,
            width: 400,
            height: 200,
            left: 24,
            right: 0,
            top: 30,
            bottom: 30,
            animate_on_load: true,
            target: document.getElementById('plot'),
            x_accessor: 'executionTime',
            y_accessor: 'availableBikesRatio',
            area: false,
            x_axis: true,
            y_axis: true,
            max_y: 1,
            min_y: 0,
            markers: markers,
            min_x: moment().subtract(11, 'days').hours(0).minutes(0),
            max_x: moment().subtract(11, 'days').hours(23).minutes(59),
        })

        //
        // Change the latest numbers.
        //
        document.getElementById('bike-status-number').innerHTML = graph_data[0]['availableBikes']
        document.getElementById('dock-status-number').innerHTML = graph_data[0]['availableDocks']

    })
}


CreateSparkLike(433)
