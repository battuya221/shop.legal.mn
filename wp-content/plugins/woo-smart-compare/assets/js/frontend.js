'use strict';

(function($) {
  var woosc_timer = 0;

  $(function() {
    woosc_load_color();
    woosc_change_count('first');
    woosc_check_buttons();
    
    woosc_hide_empty();
    woosc_hide_similarities();
    woosc_highlight_differences();

    if (woosc_vars.open_bar === 'yes') {
      woosc_load_bar('first');
    }

    $('.woosc-settings-fields').sortable({
      handle: '.label',
      update: function(event, ui) {
        woosc_save_settings();
      },
    });
  });

  // quick view
  $(document).
      on('click touch', '.woosc_table .woosq-btn, .woosc_table .woosq-link',
          function(e) {
            woosc_close_table();
            e.preventDefault();
          });

  // settings
  $(document).on('click touch', '.woosc-table-settings', function() {
    $('.woosc-settings').toggleClass('open');
  });

  $(document).on('click touch', '.woosc-bar-settings', function() {
    $('.woosc-settings').toggleClass('open');
  });

  // search
  $(document).on('click touch', '.woosc-bar-search', function() {
    $('.woosc-search').toggleClass('open');
  });

  // popup
  $(document).on('click touch', '.woosc-popup', function(e) {
    if ($(e.target).closest('.woosc-popup-content').length === 0) {
      $(this).toggleClass('open');
    }
  });

  $(document).on('keyup', '#woosc_search_input', function() {
    if ($('#woosc_search_input').val() !== '') {
      if (woosc_timer != null) {
        clearTimeout(woosc_timer);
      }

      woosc_timer = setTimeout(woosc_search, 300);
      return false;
    }
  });

  $(document).on('click touch', '.woosc-item-add', function() {
    var product_id = $(this).attr('data-id');

    $('.woosc-search').toggleClass('open');
    woosc_add_product(product_id);
    woosc_load_bar();
    woosc_load_table();
    woosc_open_table();
  });

  $(document).on('click touch', '.woosc-popup-close', function() {
    var _this_popup = $(this).closest('.woosc-popup');

    _this_popup.toggleClass('open');
  });

  // woovr
  $(document).on('woovr_selected', function(e, selected, variations) {
    var id = selected.attr('data-id');
    var pid = selected.attr('data-pid');

    if (id > 0) {
      $('.woosc-btn-' + pid).
          removeClass('woosc-btn-added woosc-added').
          attr('data-id', id);
    } else {
      $('.woosc-btn-' + pid).
          removeClass('woosc-btn-added woosc-added').
          attr('data-id', pid);
    }
  });

  // found variation
  $(document).on('found_variation', function(e, t) {
    var product_id = $(e['target']).attr('data-product_id');

    $('.woosc-btn-' + product_id).
        removeClass('woosc-btn-added woosc-added').
        attr('data-id', t.variation_id);

    if (woosc_vars.button_text_change === 'yes') {
      $('.woosc-btn-' + product_id).html(woosc_vars.button_text);
    }
  });

  // reset data
  $(document).on('reset_data', function(e) {
    var product_id = $(e['target']).attr('data-product_id');

    $('.woosc-btn-' + product_id).
        removeClass('woosc-btn-added woosc-added').
        attr('data-id', product_id);

    if (woosc_vars.button_text_change === 'yes') {
      $('.woosc-btn-' + product_id).html(woosc_vars.button_text);
    }
  });

  // remove all
  $(document).on('click touch', '.woosc-bar-remove', function() {
    var r = confirm(woosc_vars.remove_all);

    if (r == true) {
      woosc_remove_product('all');
      woosc_load_bar();
      woosc_load_table();
    }
  });

  // add
  $(document).on('click touch', '.woosc-btn', function(e) {
    var id = $(this).attr('data-id');
    var pid = $(this).attr('data-pid');
    var product_id = $(this).attr('data-product_id');

    if (typeof pid !== typeof undefined && pid !== false) {
      id = pid;
    }

    if (typeof product_id !== typeof undefined && product_id !== false) {
      id = product_id;
    }

    if ($(this).hasClass('woosc-btn-added woosc-added')) {
      if (woosc_vars.click_again === 'yes') {
        // remove
        woosc_remove_product(id);
        woosc_load_bar();
        woosc_load_table();
      } else {
        if ($('.woosc-bar-items').hasClass('woosc-bar-items-loaded')) {
          woosc_open_bar();
        } else {
          woosc_load_bar();
        }

        if (!$('.woosc-table-items').hasClass('woosc-table-items-loaded')) {
          woosc_load_table();
        }
      }
    } else {
      $(this).addClass('woosc-btn-adding woosc-adding');
      woosc_add_product(id);
      woosc_load_bar();
      woosc_load_table();
    }

    if (woosc_vars.open_table === 'yes') {
      woosc_toggle_table();
    }

    e.preventDefault();
  });

  // remove on popup
  $(document).
      on('click touch',
          '#woosc-area .woosc-bar-item-remove, #woosc-area .woosc-remove',
          function(e) {
            var product_id = $(this).attr('data-id');

            $(this).parent().addClass('removing');
            woosc_remove_product(product_id);
            woosc_load_bar();
            woosc_load_table();
            woosc_check_buttons();
            e.preventDefault();
          });

  // remove on page
  $(document).
      on('click touch', '.woosc-page .woosc-remove',
          function(e) {
            e.preventDefault();
            var product_id = $(this).attr('data-id');

            woosc_remove_product(product_id);
            location.reload();
          });

  // compare bar button
  $(document).on('click touch', '.woosc-bar-btn', function() {
    woosc_toggle_table();
  });

  // close compare
  $(document).on('click touch', function(e) {
    if ((
        (woosc_vars.click_outside === 'yes') ||
        ((woosc_vars.click_outside === 'yes_empty') &&
            (parseInt($('.woosc-bar').attr('data-count')) === 0))
    ) && (
        $(e.target).closest('.wpc_compare_count').length === 0
    ) && (
        $(e.target).closest('.woosc-popup').length === 0
    ) && (
        $(e.target).closest('.woosc-btn').length === 0
    ) && (
        $(e.target).closest('.woosc-table').length === 0
    ) && (
        $(e.target).closest('.woosc-bar').length === 0
    ) && (
        $(e.target).closest('.woosc-menu-item a').length === 0
    ) && (
        (
            woosc_vars.open_button === ''
        ) || (
            $(e.target).closest(woosc_vars.open_button).length === 0
        )
    )) {
      woosc_close();
    }
  });

  // close
  $(document).on('click touch', '#woosc-table-close', function() {
    woosc_close_table();
  });

  // open button
  if (woosc_vars.open_button !== '') {
    $(document).on('click touch', woosc_vars.open_button, function(e) {
      if ((woosc_vars.open_button_action === 'open_page') &&
          (woosc_vars.page_url !== '') && (woosc_vars.page_url !== '#')) {
        // open compare page
        window.location.href = woosc_vars.page_url;
      } else {
        e.preventDefault();
        // open compare popup
        woosc_toggle();
      }
    });
  }

  // change settings
  $(document).on('change', '.woosc-settings-field', function() {
    woosc_save_settings();
  });

  $(document).on('change', '#woosc_highlight_differences', function() {
    $('.woosc-settings').toggleClass('open');
    woosc_highlight_differences();
  });

  $(document).on('change', '#woosc_hide_similarities', function() {
    $('.woosc-settings').toggleClass('open');
    woosc_hide_similarities();
  });

  // menu item
  $(document).on('click touch', '.woosc-menu-item a', function(e) {
    if (woosc_vars.menu_action === 'open_popup') {
      e.preventDefault();

      // open compare popup
      if ($('.woosc-bar-items').hasClass('woosc-bar-items-loaded')) {
        woosc_open_bar();
      } else {
        woosc_load_bar();
      }

      if (!$('.woosc-table-items').hasClass('woosc-table-items-loaded')) {
        woosc_load_table();
      }

      woosc_open_table();
    }
  });

  function woosc_search() {
    $('.woosc-search-result').html('').addClass('woosc-loading');
    // ajax search product
    woosc_timer = null;

    var data = {
      action: 'woosc_search',
      keyword: $('#woosc_search_input').val(),
    };

    $.post(woosc_vars.ajaxurl, data, function(response) {
      $('.woosc-search-result').
          html(response).
          removeClass('woosc-loading');
    });
  }

  function woosc_set_cookie(cname, cvalue, exdays) {
    var d = new Date();

    d.setTime(d.getTime() + (
        exdays * 24 * 60 * 60 * 1000
    ));

    var expires = 'expires=' + d.toUTCString();

    document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';
  }

  function woosc_get_cookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }

      if (c.indexOf(name) == 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
      }
    }

    return '';
  }

  function woosc_get_products() {
    var woosc_cookie_products = 'woosc_products';

    if (woosc_vars.user_id !== '') {
      woosc_cookie_products = 'woosc_products_' + woosc_vars.user_id;
    }

    if (woosc_get_cookie(woosc_cookie_products) != '') {
      return woosc_get_cookie(woosc_cookie_products);
    } else {
      return '';
    }
  }

  function woosc_save_products() {
    var woosc_cookie_products = 'woosc_products';

    if (woosc_vars.user_id !== '') {
      woosc_cookie_products = 'woosc_products_' + woosc_vars.user_id;
    }

    var woosc_products = [];

    $('.woosc-bar-item').each(function() {
      var eID = $(this).attr('data-id');

      if (eID !== '') {
        woosc_products.push(eID);
      }
    });

    var woosc_products_str = woosc_products.join();

    woosc_set_cookie(woosc_cookie_products, woosc_products_str, 7);
    woosc_load_table();
  }

  function woosc_save_settings() {
    var woosc_fields = [];
    var woosc_cookie_fields = 'woosc_fields';

    if (woosc_vars.user_id !== '') {
      woosc_cookie_fields = 'woosc_fields_' + woosc_vars.user_id;
    }

    $('.woosc-settings-field').each(function() {
      var _val = $(this).val();

      if ($(this).prop('checked')) {
        woosc_fields.push(_val);
        $('.woosc_table .tr-' + _val).removeClass('tr-hide');
      } else {
        $('.woosc_table .tr-' + _val).addClass('tr-hide');
      }
    });

    woosc_set_cookie(woosc_cookie_fields, woosc_fields.join(','), 7);
    woosc_load_table();
  }

  function woosc_add_product(product_id) {
    var woosc_limit = false;
    var woosc_limit_notice = woosc_vars.limit_notice;
    var woosc_cookie_products = 'woosc_products';
    var woosc_count = 0;

    if (woosc_vars.user_id !== '') {
      woosc_cookie_products = 'woosc_products_' + woosc_vars.user_id;
    }

    if (woosc_get_cookie(woosc_cookie_products) !== '') {
      var woosc_products = woosc_get_cookie(woosc_cookie_products).split(',');

      if (woosc_products.length < woosc_vars.limit) {
        woosc_products = $.grep(woosc_products, function(value) {
          return value != product_id;
        });
        woosc_products.unshift(product_id);

        var woosc_products_str = woosc_products.join();

        woosc_set_cookie(woosc_cookie_products, woosc_products_str, 7);
      } else {
        woosc_limit = true;
        woosc_limit_notice = woosc_limit_notice.replace('{limit}',
            woosc_vars.limit);
      }

      woosc_count = woosc_products.length;
    } else {
      woosc_set_cookie(woosc_cookie_products, product_id, 7);
      woosc_count = 1;
    }

    woosc_change_count(woosc_count);
    $(document.body).trigger('woosc_added', [woosc_count]);

    if (woosc_limit) {
      $('.woosc-btn[data-id="' + product_id + '"]').
          removeClass('woosc-btn-adding woosc-adding');
      alert(woosc_limit_notice);
    } else {
      $('.woosc-btn[data-id="' + product_id + '"]').
          removeClass('woosc-btn-adding woosc-adding').
          addClass('woosc-btn-added woosc-added');

      if (woosc_vars.button_text_change === 'yes') {
        $('.woosc-btn[data-id="' + product_id + '"]').
            html(woosc_vars.button_text_added);

        $(document.body).
            trigger('woosc_change_button_text',
                [product_id, woosc_vars.button_text_added]);
      }
    }
  }

  function woosc_remove_product(product_id) {
    var woosc_cookie_products = 'woosc_products';
    var woosc_count = 0;

    if (woosc_vars.user_id !== '') {
      woosc_cookie_products = 'woosc_products_' + woosc_vars.user_id;
    }

    if (product_id != 'all') {
      // remove one
      if (woosc_get_cookie(woosc_cookie_products) != '') {
        var woosc_products = woosc_get_cookie(woosc_cookie_products).split(',');

        woosc_products = $.grep(woosc_products, function(value) {
          return value != product_id;
        });

        var woosc_products_str = woosc_products.join();

        woosc_set_cookie(woosc_cookie_products, woosc_products_str, 7);
        woosc_count = woosc_products.length;
      }

      $('.woosc-btn[data-id="' + product_id + '"]').
          removeClass('woosc-btn-added woosc-added');

      if (woosc_vars.button_text_change === 'yes') {
        $('.woosc-btn[data-id="' + product_id + '"]').
            html(woosc_vars.button_text);

        $(document.body).
            trigger('woosc_change_button_text',
                [product_id, woosc_vars.button_text]);
      }
    } else {
      // remove all
      if (woosc_get_cookie(woosc_cookie_products) != '') {
        woosc_set_cookie(woosc_cookie_products, '', 7);
        woosc_count = 0;
      }

      $('.woosc-btn').removeClass('woosc-btn-added woosc-added');

      if (woosc_vars.button_text_change === 'yes') {
        $('.woosc-btn').html(woosc_vars.button_text);

        $(document.body).
            trigger('woosc_change_button_text',
                ['all', woosc_vars.button_text]);
      }
    }

    woosc_change_count(woosc_count);
    $(document.body).trigger('woosc_removed', [woosc_count]);
  }

  function woosc_check_buttons() {
    var woosc_cookie_products = 'woosc_products';

    if (woosc_vars.user_id !== '') {
      woosc_cookie_products = 'woosc_products_' + woosc_vars.user_id;
    }

    if (woosc_get_cookie(woosc_cookie_products) != '') {
      var woosc_products = woosc_get_cookie(woosc_cookie_products).split(',');

      $('.woosc-btn').removeClass('woosc-btn-added woosc-added');

      if (woosc_vars.button_text_change === 'yes') {
        $('.woosc-btn').html(woosc_vars.button_text);

        $(document.body).
            trigger('woosc_change_button_text',
                ['all', woosc_vars.button_text]);
      }

      woosc_products.forEach(function(entry) {
        $('.woosc-btn-' + entry).addClass('woosc-btn-added woosc-added');

        if (woosc_vars.button_text_change === 'yes') {
          $('.woosc-btn-' + entry).html(woosc_vars.button_text_added);

          $(document.body).
              trigger('woosc_change_button_text',
                  [entry, woosc_vars.button_text_added]);
        }
      });
    }
  }

  function woosc_load_bar(open) {
    var data = {
      action: 'woosc_load_bar',
      products: woosc_get_products(),
    };

    $.post(woosc_vars.ajaxurl, data, function(response) {
      if ((
          woosc_vars.hide_empty === 'yes'
      ) && (
          (
              response == ''
          ) || (
              response == 0
          )
      )) {
        $('.woosc-bar-items').removeClass('woosc-bar-items-loaded');
        woosc_close_bar();
        woosc_close_table();
      } else {
        if ((
            typeof open == 'undefined'
        ) || (
            (
                open == 'first'
            ) && (
                woosc_vars.open_bar === 'yes'
            )
        )) {
          $('.woosc-bar-items').
              html(response).
              addClass('woosc-bar-items-loaded');
          woosc_open_bar();
        }
      }
    });
  }

  function woosc_open_bar() {
    $('#woosc-area').addClass('woosc-area-open-bar');
    $('.woosc-bar').addClass('woosc-bar-open');

    $('.woosc-bar-items').sortable({
      handle: 'img',
      update: function(event, ui) {
        woosc_save_products();
      },
    });

    $(document.body).trigger('woosc_bar_open');
  }

  function woosc_close_bar() {
    $('#woosc-area').removeClass('woosc-area-open-bar');
    $('.woosc-bar').removeClass('woosc-bar-open');

    $(document.body).trigger('woosc_bar_close');
  }

  function woosc_load_table() {
    $('.woosc-table-inner').addClass('woosc-loading');

    var data = {
      action: 'woosc_load_table',
      products: woosc_get_products(),
    };

    $.post(woosc_vars.ajaxurl, data, function(response) {
      $('.woosc-table-items').
          html(response).
          addClass('woosc-table-items-loaded');
      if ($(window).width() >= 768) {
        if ((woosc_vars.freeze_column === 'yes') &&
            (woosc_vars.freeze_row === 'yes')) {
          // freeze row and column
          $('#woosc_table').tableHeadFixer({'head': true, left: 1});
        } else if (woosc_vars.freeze_column === 'yes') {
          // freeze column
          $('#woosc_table').tableHeadFixer({'head': false, left: 1});
        } else if (woosc_vars.freeze_row === 'yes') {
          // freeze row
          $('#woosc_table').tableHeadFixer({'head': true});
        }
      } else {
        if (woosc_vars.freeze_row === 'yes') {
          // freeze row
          $('#woosc_table').tableHeadFixer({'head': true});
        }
      }

      if (woosc_vars.scrollbar === 'yes') {
        $('.woosc-table-items').perfectScrollbar({theme: 'wpc'});
      }

      $('.woosc-table-inner').removeClass('woosc-loading');
      woosc_hide_empty();
      woosc_hide_similarities();
      woosc_highlight_differences();
    });
  }

  function woosc_open_table() {
    $('#woosc-area').addClass('woosc-area-open-table');
    $('.woosc-table').addClass('woosc-table-open');
    $('.woosc-bar-btn').addClass('woosc-bar-btn-open');

    if (woosc_vars.bar_bubble === 'yes') {
      $('.woosc-bar').removeClass('woosc-bar-bubble');
    }

    if (!$.trim($('.woosc-table-items').html()).length) {
      woosc_load_table();
    }

    $(document.body).trigger('woosc_table_open');
  }

  function woosc_close_table() {
    $('#woosc-area').removeClass('woosc-area-open woosc-area-open-table');
    $('.woosc-table').removeClass('woosc-table-open');
    $('.woosc-bar-btn').removeClass('woosc-bar-btn-open');

    if (woosc_vars.bar_bubble === 'yes') {
      $('.woosc-bar').addClass('woosc-bar-bubble');
    }

    $(document.body).trigger('woosc_table_close');
  }

  function woosc_toggle_table() {
    if ($('.woosc-table').hasClass('woosc-table-open')) {
      woosc_close_table();
    } else {
      woosc_open_table();
    }
  }

  function woosc_open() {
    $('#woosc-area').addClass('woosc-area-open');
    woosc_load_bar();
    woosc_load_table();
    woosc_open_bar();
    woosc_open_table();

    $(document.body).trigger('woosc_open');
  }

  function woosc_close() {
    $('#woosc-area').removeClass('woosc-area-open');
    woosc_close_bar();
    woosc_close_table();

    $(document.body).trigger('woosc_close');
  }

  function woosc_toggle() {
    if ($('#woosc-area').hasClass('woosc-area-open')) {
      woosc_close();
    } else {
      woosc_open();
    }

    $(document.body).trigger('woosc_toggle');
  }

  function woosc_load_color() {
    var bg_color = $('#woosc-area').attr('data-bg-color');
    var btn_color = $('#woosc-area').attr('data-btn-color');

    $('.woosc-table').css('background-color', bg_color);
    $('.woosc-bar').css('background-color', bg_color);
    $('.woosc-bar-btn').css('background-color', btn_color);
  }

  function woosc_change_count(count) {
    if (count == 'first') {
      var products = woosc_get_products();

      if (products != '') {
        var products_arr = products.split(',');

        count = products_arr.length;
      } else {
        count = 0;
      }
    }

    $('.woosc-menu-item').each(function() {
      if ($(this).hasClass('menu-item-type-woosc')) {
        $(this).find('.woosc-menu-item-inner').attr('data-count', count);
      } else {
        $(this).
            addClass('menu-item-type-woosc').
            find('a').
            wrapInner(
                '<span class="woosc-menu-item-inner" data-count="' + count +
                '"></span>');
      }
    });

    $('#woosc-area').attr('data-count', count);
    $('.woosc-bar').attr('data-count', count);

    $(document.body).trigger('woosc_change_count', [count]);
  }

  function woosc_hide_empty() {
    $('.woosc_table > tbody > tr').each(function() {
      var $tr = $(this);
      var _td = 0;
      var _empty = true;

      $tr.children('td').each(function() {
        if ((_td > 0) && ($(this).html().length > 0)) {
          _empty = false;
          return false;
        }
        _td++;
      });

      if (_empty) {
        $tr.addClass('tr-empty').remove();
      }
    });
  }

  function woosc_highlight_differences() {
    if ($('#woosc_highlight_differences').prop('checked')) {
      $('.woosc_table > tbody > tr').each(function() {
        var $tr = $(this);
        var _td = 0;
        var _val = $(this).children('td').eq(1).html();
        var _differences = false;

        $tr.children('td:not(.td-placeholder)').each(function() {
          if ((_td > 1) && ($(this).html() !== _val)) {
            _differences = true;
            return false;
          }
          _td++;
        });

        if (_differences) {
          $tr.addClass('tr-highlight');
        }
      });
    } else {
      $('.woosc_table tr').removeClass('tr-highlight');
    }
  }

  function woosc_hide_similarities() {
    if ($('#woosc_hide_similarities').prop('checked')) {
      $('.woosc_table > tbody > tr').each(function() {
        var $tr = $(this);
        var _td = 0;
        var _val = $(this).children('td').eq(1).html();
        var _similarities = true;

        $tr.children('td:not(.td-placeholder)').each(function() {
          if ((_td > 1) && ($(this).html() !== _val)) {
            _similarities = false;
            return false;
          }
          _td++;
        });

        if (_similarities) {
          $tr.addClass('tr-similar');
        }
      });
    } else {
      $('.woosc_table tr').removeClass('tr-similar');
    }
  }
})(jQuery);