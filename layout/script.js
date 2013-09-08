'use strict';

!function(window, undefined){

var document = window.document,
    $ = window.jQuery,
    Modernizr = window.Modernizr,
    History = window.History;

// mudar página/histórico sem recarregar, mantendo o player tocando
// (e afetando minimamente a UX)
/*
TODO não fazer nada para links externos
TODO carregar página num <iframe> usando location.replace() para:
     - preservar rodinha girando (por ser navegação em um <iframe>)
     - preservar histórico (utilizando location.replace())
     - e, então, substituir o conteúdo de #miolo pelo que estiver no <iframe>
TODO preservar scrollTop das páginas
TODO onloads devem funcionar normalmente -- nem todos estão compatíveis ainda
*/
$(function(){
    $.event.trigger('radioblastcontentloaded', document);
});
$.radioblastready = function(callback) {
    $(document).on('radioblastcontentloaded', callback);
};

$(window).on('statechange', function(){
    var s = History.getState();
    $('#miolo').load(s.url + ' #miolo', function(){
        $(this).children('#miolo').unwrap();
        $('html').toggleClass('home', s.url.indexOf('index.html') != -1); // XXX
        $.event.trigger('radioblastcontentloaded', this);
    });
});

//$(function(){
//    setTimeout(function(){
//        $(document).on('click', 'a', function(e){
//            if (e.isDefaultPrevented() || $(this).attr('href').indexOf('#') != -1) return false;
//            History.pushState({scroll: $(window).scrollTop()}, 'Carregando...', $(this).attr('href'));
//            return false;
//        });
//    }, 0);
//});

// função splice

String.prototype.splice = function() {
    var c = this.split('');
    arguments[1] -= arguments[0];
    Array.prototype.splice.apply(c, arguments);
    return c.join('');

};

// MediaElement.js + jquery.once
// talvez eu nem precise disto, mas vai que...

!function(){return;

var realmep = $.fn.mediaelementplayer;
$.fn.mediaelementplayer = function() {
    return this.once(function(){ realmep.apply($(this), arguments); });
};

}();

// scrollify

$.fn.scrollify = function() { return this.once(function(){

    if (!$.scrollbarSize) return;

    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    function scrollupdate(e) {
        scrollarrowl.toggle(mainmenu.scrollLeft() > 0);
        scrollarrowr.toggle(mainmenu.scrollLeft() + mainmenu[0].clientWidth < mainmenu[0].scrollWidth);

        // corrige interação entre -webkit-overflow-scrolling e mudança de
        // orientação no iOS
        if (scrollarrows.children().is(':visible') && e && e.type == 'resize') {
            var last = $(':last', mainmenu);
            last.css('width', last.cssWidth()+1000);
            mainmenu.lockCss('width');
            setTimeout(function(){
                last.add(mainmenu).resetCss('width');
            }, $.fx.interval);
        }
    }

    function _scroll() {
        var prev = mainmenu.scrollLeft();
        mainmenu.scrollLeft(prev + count);
        if (prev == mainmenu.scrollLeft() || !held) {
            clearInterval(iid);
            return;
        }
        count = clamp(count + (1 - 2*(count < 0)), -MAXSPEED, MAXSPEED);
    }

    function doscroll(e) {
        e.preventDefault();
        count = 1 - 2*$(this).is('.left');
        held = e.type == 'mousedown';
        clearInterval(iid);
        if (held) iid = setInterval(_scroll, $.fx.interval);
    }

    $(window).on('resize', scrollupdate);

    var
    count, iid,
    scrollarrowl = $('<div class="scrollarrow left">\u00ab</div>'),
    scrollarrowr = $('<div class="scrollarrow right">\u00bb</div>'),
    scrollarrows = $('<div class="scrollarrows"></div>')
                    .append(scrollarrowl).append(scrollarrowr)
                    .on('mousedown mouseup mouseout', '.scrollarrow', doscroll),
    mainmenu = this.before(scrollarrows).on('scroll', scrollupdate),
    MAXSPEED = v == '#calendaritems' ? 30 : 5, // XXX hardcode
    held = false;

    setTimeout(scrollupdate, 500);
})};

// atalho para parseFloat($().css('width')) (e height também)

$.fn.cssWidth  = function(){ return parseFloat(this.css('width' )); };
$.fn.cssHeight = function(){ return parseFloat(this.css('height')); };

// ~framework~ para testar elementos

$.test = function(html) {
    var elem = $(html).css({position: 'absolute', left: -9001})
               .appendTo(document.documentElement).addClass('elemtest');
    setTimeout(function(){
        $(function(){elem.remove()});
    }, 0);
    return elem;
}

// calcular tamanho das barras de rolagem

!function(){
    var test = $.test(
    '<div style="overflow:auto;width:100px;height:auto;">\
            <div style="width:200px;height:100px;"></div>\
        </div>');
    $.scrollbarSize = test.cssHeight() - $('div', test).cssHeight();
}();

// tipos de <input> suportados

!function(){
    var selector = [];
    $.each('\
text search tel url email password \
datetime date month week time datetime-local \
number range color checkbox radio file submit image reset button'.split(' '),
function(i, type){
    var test = $.test('<input type="'+type+'">');
    if (type == test.prop('type'))
        selector.push('input[type="'+type+'"]');
});
    $(function(){
        $(selector.join(',')).addClass('supported');
    });
}();

// <meter> shim

$.fn.meterShim.supportsMeter = $.fn.meterShim.supportsMeter && !window.opera;
$.radioblastready(function(){
    $('meter').once(function(){$(this).meterShim()});
});

// imagens quebradas

$(document)
.on('error', 'img', function(){
    $(this).addClass('broken');
})
.on('load', 'img', function(){
    $(this).removeClass('broken');
});

// transitionend

$.support.transitionend = ({
    'WebkitTransition' : 'webkitTransitionEnd',
    'MozTransition'    : 'transitionend',
    'OTransition'      : 'oTransitionEnd otransitionend',
    'transition'       : 'transitionend'
})[ Modernizr.prefixed('transition') ];

// Drupal

!function(){

var Drupal = window.Drupal = {settings:{timezone:180},
t:function(str, args) {
  // Fetch the localized version of the string.
  if (Drupal.locale.strings && Drupal.locale.strings[str]) {
    str = Drupal.locale.strings[str];
  }

  if (args) {
    // Transform arguments before inserting them
    for (var key in args) {
      switch (key.charAt(0)) {
        // Escaped only
        case '@':
          args[key] = Drupal.checkPlain(args[key]);
        break;
        // Pass-through
        case '!':
          break;
        // Escaped and placeholder
        case '%':
        default:
          args[key] = Drupal.theme('placeholder', args[key]);
          break;
      }
      str = str.replace(key, args[key]);
    }
  }
  return str;
},
locale:false,
checkPlain:function(str) {
  str = String(str);
  var replace = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
  for (var character in replace) {
    var regex = new RegExp(character, 'g');
    str = str.replace(regex, replace[character]);
  }
  return str;
},
formatPlural:function(count, singular, plural, args) {
  var args = args || {};
  args['@count'] = count;
  // Determine the index of the plural form.
  var index = Drupal.locale.pluralFormula ? Drupal.locale.pluralFormula(args['@count']) : ((args['@count'] == 1) ? 0 : 1);

  if (index == 0) {
    return Drupal.t(singular, args);
  }
  else if (index == 1) {
    return Drupal.t(plural, args);
  }
  else {
    args['@count['+ index +']'] = args['@count'];
    delete args['@count'];
    return Drupal.t(plural.replace('@count', '@count['+ index +']'));
  }
}
};
Drupal.settings.radioblast = {
offtitle: 'Rádio offline',
nodjmsg: [
'Não há nenhum DJ para tocar músicas ou atender pedidos. Saia da internet e vá ler um livro!',
'Porém, se você ainda está ouvindo a rádio normalmente, não há o que temer: o servidor do site deve ter pego as estatísticas do servidor da rádio no momento em que um DJ saía e outro entrava, resultando em um falso positivo. Ou, simplesmente, o DJ perdeu temporariamente a conexão. Leia o <a href="#">FAQ</a> para saber mais.'
],
offmsg: [
'A conexão do servidor do site com o servidor da rádio foi perdida. Saia da internet e vá ler um livro!',
'No entanto, isto pode ser apenas uma falha temporária do site; se você ainda consegue ouvir a rádio sem problemas, não há o que temer! Leia o <a href="#">FAQ</a> para saber mais.'
]
};

}();

// marquee

$.fn.marquee = function(scrollspd, scrolldelay, easing){
    scrolldelay = scrolldelay || 0;
    easing = easing || 'swing';
    return this.each(function(){
        function animatef() {
            if (!wrapper.is(':visible')) return;
            wrapper.animate({left:-off},
            {duration: scrollspd,
            easing: easing,
            complete: function(){
                setTimeout(animateb, scrolldelay);
            }});
        }
        function animateb() {
            if (!wrapper.is(':visible')) return;
            wrapper.animate({left:0},
            {duration: scrollspd,
            easing: easing,
            complete: function(){
                setTimeout(animatef, scrolldelay);
            }});
        }

        var
        $sel = $(this)
               .lockCss('width')
               .css('overflow', 'hidden'),
        wrapper = $sel
                  .wrapInner('<div style="left:0;position:relative;overflow:hidden"></div>')
                  .children(),
        off = 0,
        i   = 1,
        ii  = 0;
        do {
            ii = i*10000;
            wrapper.scrollLeft(ii);
            off = wrapper.scrollLeft();
        } while (ii == off);
        wrapper.scrollLeft(0).resetCss('overflow');
        if (off) {
            if ($.fx.off) {
                $sel.html('<marquee scrollamount="5" scrolldelay="13" style="position:absolute;left:0;right:0">'+$sel.text()+'</marquee>');
            }
            else setTimeout(animatef, scrolldelay);
        }
    });
};

// desabilita/habilita focus

!function(){

var focusables = 'a, button, input, label, select, textarea, [tabindex]';

function getfocusables(obj) {
    return obj.find(focusables).add(obj.filter(focusables));
}

$.fn.extend({
    disableFocus: function(tag) {
        if (tag === undefined) tag = '_';
        getfocusables(this).each(function(){
            var $this = $(this),
                tags = $this.data('tabindex.tags') || [];
            if (!tags.length) {
                var tabindex = $this.attr('tabindex');
                if (tabindex !== undefined)
                    $this.data('tabindex.prev', tabindex);
                $this.attr('tabindex', -1);
            }
            if ($.inArray(tag, tags) == -1) tags.push(tag);
            $this.data('tabindex.tags', tags);
        });
        return this;
    },
    enableFocus: function(tag) {
        if (tag === undefined) tag = '_';
        getfocusables(this).each(function(){
            var $this = $(this),
                tags = $this.data('tabindex.tags') || [];
            if ($.inArray(tag, tags) == -1) return;
            tags = $.grep(tags, function(i){ return i!==tag; });
            if (!tags.length) {
                var tabindex = $this.data('tabindex.prev');
                if (tabindex === null)
                    $this.removeAttr(tabindex);
                else $this.attr('tabindex', tabindex);
                $this.removeData('tabindex.tags').removeData('tabindex.prev');
            }
            else $this.data('tabindex.tags', tags);
        });
        return this;
    }
});

}();

// canvas adaptado pra retina display

!function(){

var devicePixelRatio = window.devicePixelRatio || 1;

$.canvas = function(w, h, hq) {
    var ret = $(document.createElement('canvas')),
        context = ret[0].getContext('2d');

    ret.attr({
        width: w * devicePixelRatio,
        height: h * devicePixelRatio
    });
    if (hq) ret.css({
        width: w,
        height: h
    });
    context.scale(devicePixelRatio, devicePixelRatio);
    /*context.imageSmoothingEnabled = true;*/
    return ret[0];
};

}();

// css lock

$.fn.extend({
    lockCss: function(props) {
        props = props.split(' ');
        return this.each(function(){
            var obj = {}, $this = $(this);
            $.each(props, function(i, p) {
                obj[p] = $this.css(p);
            });
            $this.css(obj);
        });
    },
    resetCss: function(props) {
        if (!props) return this.removeAttr('style');
        var obj = {};
        $.each(props.split(' '), function(i, p) {
            obj[p] = '';
        });
        return this.css(obj);
    }
});

// fusão de hover e focus

!function(){

function runhandler(elem, grabbing, e) {
    var data = $(elem).data();
    if (grabbing && (data.attentionmouse || data.attentionfocus) || data.attentionmouse && data.attentionfocus) return;
    e.type = 'attention'+(grabbing?'grab':'drop');
    $(e.delegateTarget).triggerHandler(e);
}

function attentionsetup(handlerObj) {
    var t = $(this), attentionset = t.data('attentionset') || 0;
    if (!attentionset)
        t.on('mouseenter.attention mouseleave.attention focusin.attention focusout.attention', handlerObj.selector, handlerObj.data, function(e){
            var grabbing = /^(?:mouse(?:over|enter)|focus(?:in)?)$/.test(e.type);
            runhandler(this, grabbing, e);
            $(this).data('attention'+(/^(?:mouse(?:over|enter|out|leave))$/.test(e.type) ? 'mouse' : 'focus'), grabbing);
        });
    t.data('attentionset', attentionset+1);
}

function attentionteardown(handlerObj) {
    var t = $(this), attentionset = (t.data('attentionset') || 1) - 1;
    if (!attentionset)
        t.off('.attention', handlerObj.selector);
    t.data('attentionset', attentionset);
}

$.each(['grab', 'drop'], function(i, way) {
    $.event.special['attention'+way] = {
        add: attentionsetup,
        remove: attentionteardown
    };
});

}();

// desabilitar eventos de mouse se houver touchscreen

!function(){

var lasttime = 0, x, y;

if (Modernizr.touch) {
    $(document)
    .on('touchstart touchend touchcancel', function(e){
        lasttime = e.timeStamp;
        $('html').removeClass('no-touch');
        $(document).on('mousedown.m mousemove.m mouseup.m', function(e){
            if ($('html').hasClass('no-touch')) return;
    
            if (e.timeStamp - lasttime > 2000
                && !(e.type == 'mousemove' && x == e.pageX && y == e.pageY)
            ) {
                $('html').addClass('no-touch');
                $(document).off('.m');
            }
            else e.stopImmediatePropagation();
    
            x = e.pageX;
            y = e.pageY;
        });
    });
}

}();

// "ativar" focus (estilos) assim que usar teclado
// mas "desativar" se houver mouse

$(document)
.on('keydown keypress keyup', function(){
    if ($('html').hasClass('focus')) return;
    $('html').addClass('focus');
    $(document).one('mousedown', function(){
        $('html').removeClass('focus');
    });
});
$('html').removeClass('focus');

// ajustes de waypoints.js

$.waypoints.settings = {
    resizeThrottle: 0,
    scrollThrottle: 0
};

}(window);