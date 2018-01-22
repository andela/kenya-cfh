$(document).on('click', '.panel-heading span.icon_minim', function() {
  const $this = $(this);
  if (!$this.hasClass('panel-collapsed')) {
    $this.parents('.chat-window').css('bottom', '-300px');
    $this.addClass('panel-collapsed');
    $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
  } else {
    $this.parents('.chat-window').css('bottom', '3rem');
    $this.removeClass('panel-collapsed');
    $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
  }
});

