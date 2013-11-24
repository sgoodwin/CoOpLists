/* global SockJS, $ */
var sockjs = new SockJS('/list'),
    parts = [],
    recalculate = function(items){
      var total = 0;
      items.forEach(function(part){
        total += Number(part.price);
      });

      $('#total').text('' + items.length + ' Items: $' + total);
    };

$(function(){
  $('#partInput').focus();
});

sockjs.onmessage = function(event){
  var part = JSON.parse(event.data);
  parts.push(part);

  $('ul').append('<li>' + part.text+ '<span>$' + part.price + '</span></li>');

  recalculate(parts);
};

$('form').submit(function(){
  var field = $('#partInput');
  sockjs.send(field.val());

  field.val('');
  field.focus();

  return false;
});
