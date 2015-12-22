
function fetchVoteActivities() {
  $.ajax({
    url: '/api/activity'
  }).then(function(data) {
    data.forEach(function(theme, index) {
      $('div#activities').append(
        '<a id="'+data[index]._id+'" href="#">'+
        '<div class="col-md-3 col-sm-4">'+
            '<div class="activity">'+
                '<div class="text">'+
                  '<h3>'+data[index].activityVerb+'</h3>'+
                  '<h3>'+data[index].activity+'</h3>'+
                  '<h3>'+data[index].specificLocation+'</h3>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '</a'
      );
      $('a#'+data[index]._id).click(function(e) {
        e.preventDefault();
        $.ajax({
          type: 'GET',
          url: '/api/vote/'+data[index]._id,
          data: {},
          success: function(data, textStatus) {
            window.location.href = '/feeling';
          },
          error: function(jqXHR, textStatus, errorThrown) {
          }
        });
      });
    });
  });
}

function fetchMyActivities() {
  $.ajax({
    url: '/api/myactivities'
  }).then(function(data) {
    data.forEach(function(theme, index) {
      $('div#activities').append(
        '<a id="'+data[index]._id+'" href="#">'+
        '<div class="col-sm-4">'+
            '<div class="activity">'+
                '<div class="text">'+
                  '<h3>'+data[index].activityVerb+'</h3>'+
                  '<h3>'+data[index].activity+'</h3>'+
                  '<h3>'+data[index].specificLocation+'</h3>'+
                  '<p class="votes">'+data[index].numVotes+'</p>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '</a'
      );
      $('a#'+data[index]._id).click(function(e) {
        e.preventDefault();
        $.ajax({
          type: 'GET',
          url: '/api/choose/'+data[index]._id,
          data: {},
          success: function(data, textStatus) {
            window.location.href = '/feeling';
          },
          error: function(jqXHR, textStatus, errorThrown) {
          }
        });
      });
    });
  });
}

function prepareFeelings() {
  $('table#feeling a').each(function( index ) {
    $(this).click(function(e) {
      e.preventDefault();
      $.ajax({
        type: 'GET',
        url: '/api/feeling/'+$(this).attr('name'),
        data: {},
        success: function(data, textStatus) {
          window.location.href = '/severity';
        },
        error: function(jqXHR, textStatus, errorThrown) {
        }
      });
    });
  });
}

function processSeveritySubmission() {
  $('button#severity').click(function(e) {
    e.preventDefault();
    $.ajax({
      type: 'GET',
      url: '/api/severity/'+$('input#severity').val(),
      data: {},
      success: function(data, textStatus) {
        window.location.href = '/myactivity';
      },
      error: function(jqXHR, textStatus, errorThrown) {
      }
    });
  });
}

function updateViewOnSeverityChange() {
  $('input#severity').change(function() {
    var newVal = this.value;
    $('img#severity').css('opacity', newVal/10.0);
  });
}
