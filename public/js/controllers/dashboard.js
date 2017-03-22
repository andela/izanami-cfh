angular.module('mean.system')
  .controller('dashboard', ['$scope', ($scope) => {

  }]);

$(document).ready(() => {
  $(document).on('click', '#menu-toggle', () => {
    $('#wrapper').toggleClass('toggled');
  });
});

function removeToggled() {
  if ($(window).width() > 800) {
    $('#wrapper').removeClass('toggled');
  }
}

