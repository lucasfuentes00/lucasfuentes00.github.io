$(function()
{
  $("#segundoTexto").hide();
  $("#primeroTexto").hide();
  $(".segundoImagen").hide();

  $("#primero").mouseenter(function(){
    $("#primero").hide();
    $("#primeroTexto").show();
  });

  $("#primeroTexto").mouseleave(function(){
    $("#primeroTexto").hide();
    $("#primero").fadeIn();
  });


  $("#segundo").mouseenter(function(){
    $("#segundo").hide();
    $("#segundoTexto").show();
    $(".segundoImagen").show();
  });

  $(".segundoImagen").mouseleave(function(){
    $("#segundoTexto").hide();
    $(".segundoImagen").hide();
    $("#segundo").fadeIn();
  });

});

const music = new Audio('../assets/menu_intro.mp3');
music.play();
music.loop =true;
