
function fetchActivities() {
  $.ajax({
      url: "http://www.designmyday.co/api/activity?city=Ubud"
  }).then(function(data) {
    data.forEach(function(theme, index) {
      $('div#activities').append(
        '<a href="'+data[index].link+'" target="_blank">'+
        '<div class="col-md-3 col-sm-4">'+
            '<div class="activity">'+
                '<div class="text">'+
                  '<h3>'+data[index].activityVerb+'</h3>'+
                  '<h3>'+data[index].activity+'</h3>'+
                  '<h3>'+data[index].specificLocation+'</h3>'+
                  '<p class="votes">'+data[index].targetIntensity+'</p>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '</a'
      );
    });
  });
}
