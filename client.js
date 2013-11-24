/* global SockJS, $ */
var sockjs = new SockJS('/list'),
    parts = [],
    recalculate = function(items){
      var total = 0;
      items.forEach(function(part){
        total += Number(part.price);
      });

      $('#total').text('' + items.length + ' Items: $' + total);
    },
    addPart = function(part){
      $('ul').append('<li>' + part.text+ '<span>$' + part.price + '</span></li>');
    };

$(function(){
  $('#partInput').focus();
});

sockjs.onmessage = function(event){
  var partEvent = JSON.parse(event.data);

  if(partEvent.type === 'add'){
    parts.push(partEvent.part);
    addPart(partEvent.part);
  }
  if(partEvent.type === 'list'){
    parts = partEvent.parts;
    parts.forEach(addPart);
  }

  recalculate(parts);
};

$('form').submit(function(){
  var field = $('#partInput');
  sockjs.send(JSON.stringify({text: field.val(), type: 'add' }));

  field.val('');
  field.focus();

  return false;
});
