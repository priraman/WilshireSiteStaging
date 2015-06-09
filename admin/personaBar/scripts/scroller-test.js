'use strict';
define(['QUnit', 'jquery', '../scripts/scroller', '../scripts/util-mock-for-test'], function (QUnit, $, scroller, util) {
    return {
      run: function(callback) {
          test('CMX Scroller Tests', function () {
              // add scroller to page
              $('body').append('<div id="card-holder"></div>');
              // add 3 cards to scroller
              for (var i = 0; i < 3; i++) {
                  $('#card-holder').append('<div class="card"></div>');
              }
              // add left/right buttons for scroller
              $('body').append('<div id="card-holder-left"></div>');
              $('body').append('<div id="card-holder-right"></div>');
              
              scroller.init($('#card-holder'), $('.card'), $('#card-holder-left'), $('#card-holder-right'), 100, 400);
              QUnit.stop();
              util.asyncWaterfall([
                      function(cb) {
                          // 3 cards should not show left/right buttons
                          equal($('#card-holder-left').css('visibility'), 'hidden');
                          equal($('#card-holder-right').css('visibility'), 'hidden');
                          equal($('#card-holder').css('left'), '100px');

                          // tear down after test
                          $('#card-holder').remove();
                          $('#card-holder-left').remove();
                          $('#card-holder-right').remove();

                          // add scroller to page
                          $('body').append('<div id="card-holder"></div>');
                          // add 7 cards to scroller
                          for (var i = 0; i < 7; i++) {
                              $('#card-holder').append('<div class="card"></div>');
                          }
                          // add left/right buttons for scroller
                          $('body').append('<div id="card-holder-left"></div>');
                          $('body').append('<div id="card-holder-right"></div>');

                          scroller.init($('#card-holder'), $('.card'), $('#card-holder-left'), $('#card-holder-right'), 100, 400);

                          // 7 cards should show left/right buttons
                          notEqual($('#card-holder-left').css('visibility'), 'hidden');
                          notEqual($('#card-holder-right').css('visibility'), 'hidden');
                          equal($('#card-holder').css('left'), '100px');

                          $('#card-holder-right').trigger('click');
                          cb();
                      },
                      function(cb) {
                          setTimeout(cb, 1000);
                      },
                      function(cb) {
                          // after scroll animation, it should scroll 400px
                          equal($('#card-holder').css('left'), '-300px');
                          cb();
                      }
                ], function () {
                    // tear down after test
                    $('#card-holder').remove();
                    $('#card-holder-left').remove();
                    $('#card-holder-right').remove();

                    QUnit.start();
                    if (typeof callback === 'function') callback();

                  });
          });
      }  
    };
});