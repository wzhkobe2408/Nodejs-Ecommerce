$(function() {

  Stripe.setPublishableKey('pk_test_vVbvKTF6GgisCqrDwWgYmytN');

  $('#search').keyup(function() {
    var search_term = $(this).val();
    $.ajax({
      method:'POST',
      url:'/api/search',
      data:{
        search_term
      },
      dataType:'json',
      success:function(json) {
        var data = json.hits.hits.map(function(hit) {
          return hit;
        });
        $('.container').addClass('search-box');
        $('#searchResults').empty();
        for(var i = 0; i < data.length; i++) {
          var html =
          `
            <div class="col-md-4">
            <a href="/product/${data[i]._id}" >
            <div class="thumbnail">
              <img src="${data[i]._source.image}" alt="pic">
              <div class="caption">
                <h3>${data[i]._source.name}</h3>
                <p>${data[i]._source.category.name}</p>
                <p>$${data[i]._source.price}</p>
              </div>
            </div>
          </a>
        </div>
          `;
        $('#searchResults').append(html);
        }
      },
      error:function(error){
        console.log(error);
      }
    });
  });

  $(document).on('click','#plus',function(e) {
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());
    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });

  $(document).on('click','#minus',function(e) {
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());

    if(quantity == 1) {
      priceValue = $('#priceHidden').val();
      quantity = 1;
    } else {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;
    }

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });


  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');

    if(response.error) {
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      var token = response.id;
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      $(form).get(0).submit();
    }
  };

  $('#payment-form').submit(function(event) {
    var $form = $(this);
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken($form, stripeResponseHandler);
    return false;
  });

})
