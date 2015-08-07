// Create datastore.

function CallAPICreateDatastore(resource_id) {
  var u = '/create/' + resource_id

  console.log(u)
  d3.json(u, function(err, data) {
    if (err)
      return console.error(err)

    d = document.getElementById("datastore-status-box")
    if (data.success == true) {
      p = '<p>Success <span class="fui-check"></span></p>'
      d.innerHTML = p
    }

    else {
      p = '<p>Fail <span class="fui-cross"></span></p>'
      d.innerHTML = p
    }
  })
}
