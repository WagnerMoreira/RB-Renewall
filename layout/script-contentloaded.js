'use strict';

!function(window, undefined){

var document = window.document,
    $ = window.jQuery,
    Modernizr = window.Modernizr;

// scroll dos menus principais

// XXX
$(function(){
    $('body').prepend('<div style="z-index:1;border:1px solid black;position:absolute;right:0;top:0;background:white;padding:0.4rem;"><a href="index.html" style="text-decoration:underline;">Principal</a><br><a href="postlist.html" style="text-decoration:underline;">Lista posts</a><br><a href="post.html" style="text-decoration:underline;">Um post</a><br><a href="blogs.html" style="text-decoration:underline;">Blogs</a><br><a href="equipe.html" style="text-decoration:line-through;">Equipe</a><br><a href="resenhas.html" style="text-decoration:line-through;">Resenhas</a><br><a href="podcasts.html" style="text-decoration:line-through;">Podcasts</a></div>');
});
// XXX

$(function(){
    $('#mainmenu > ul, #secmenu > ul').scrollify();
});

// fixar menu no topo

$(function(){
    var t = $('#topo').wrap('<div></div>'),
    wrap = t.parent();
    wrap.waypoint({
        handler: function(e, d) {
            wrap.css('height', d == 'down' ? t.cssHeight() : 'auto');
            t.toggleClass('fixed', d == 'down');
        }
    });
});

// submenu Rádio

$(function(){

var
selector = '#mainmenu .branch > a, #radio-sub',
hover = false,
touch = false,
t = null;

function calchover() {
    $(selector).toggleClass('active', hover);
    if (hover) $('#radio-sub').offset({left: Math.max(0, $('#mainmenu .branch > a').offset().left)});
}

$('#mainmenu .branch > a')
.on('touchstart', function(e){
    touch = true;
})
.on('mousedown', function(e){
    if (touch) e.preventDefault();
    touch = false;
});

$(selector).on('attentiongrab attentiondrop', function(e){
    hover = e.type == 'attentiongrab';
    if (t) clearTimeout(t);
    t = setTimeout(calchover, $.fx.interval);
});

$(calchover);

});

// luzes

$(function(){
    $('#lights > a').on('click', function(e){
        e.preventDefault();
        $('html').toggleClass('night');
        $(this).text('Luzes' + ($('html').hasClass('night') ? 'apagadas' : 'acesas'));
    });
});

// rótulos como placeholder

$.radioblastready(function(e, ctx){
    var selector = 'input, textarea';

    function placeholder() {
        var t = $(this);
        setTimeout(function(){
            $('label[for='+t.attr('id')+']').toggleClass('emptyfield', !t.val());
        }, 0);
    }

    $('form', ctx).find(selector).off('.pll').on('keydown.pll', placeholder)
    .each(function(){
        $('label[for='+$(this).attr('id')+']').addClass('placeholder');
        placeholder.apply(this);
    });
});

// slidshow da home
// TODO fundir as duas versões, deu preguiça na hora

!function(){

var kenburnsns = '.kenburns',
    kenburnsend = ($.support.transitionend + ' ').replace(/ /g, kenburnsns),
    hardware = Modernizr.csstransforms3d && Modernizr.csstransitions
// sniff - transforms 3D ficam ruins no Firefox
            && navigator.userAgent.indexOf('Gecko/') == -1;

// slideshow da home - usando transformações 3D e transições

$(function(){
    if (!$('#destaques').length || !hardware || $('#destaques').hasClass('processed')) return;

    function toPercent(num, den, prec) {
        return (100 * num / den).toFixed(prec || 6) * -1 * -1 + '%';
    }

    function rect(x, y, s) {
        s = (x && y ? [0.8, 0.9] : [0.9, 1])[1*!!(s+1)];
        x = (x+1)/2;
        y = (y+1)/2;
        return function(img) {
            var cw = destaques.cssWidth(),
                ch = destaques.cssHeight(),
                iw = img.naturalWidth,
                ih = img.naturalHeight,
                scale = Math.max(cw / iw, ch / ih),
                ew = img.naturalWidth * scale,
                eh = img.naturalHeight * scale,
                ew2 = ew * 1/s,
                eh2 = eh * 1/s,
                tx = -x * (ew2 - cw),
                ty = -y * (eh2 - ch);
            return {
                transform: 'scale('+((1/s).toFixed(6) * -1 * -1)+')'
                         +' translate3d('+toPercent(tx, ew2)+', '+toPercent(ty, eh2)+', 0)',
                width: toPercent(ew, cw),
                height: toPercent(eh, ch)
            };
        };
    }

    function startkenburns() {

        function kenburns() {
            var i, src, dst;
            do {
                i = Math.floor(Math.random() * sourcerects.length);
                src = sourcerects[i](img);
                dst = destrects[i](img);
            } while (src.transform == dst.transform);
            $('img', item).css(src)
            $('a', item).removeAttr('tabindex');
            setTimeout(function(){
                items.not(item).removeClass('current').find('a').attr('tabindex', -1);
                $('span', bullets).removeClass('current');
                if (focused) {
                    focused = 1;
                    $('a', item).focus();
                    focused = 2;
                }
                $('span', bullets).eq(index).addClass('current');
                item.addClass('current showing').one(kenburnsend, 'img', function(){
                    destaques.removeClass('transition');
                    $(img).css(dst).one(kenburnsend, function(){
                        if (item.find('a').is(':hover, :focus'))
                            item.find('a').one('attentiondrop'+kenburnsns, kenburnsswitch);
                        else setTimeout(kenburnsswitch, 0);
                    });
                });
            }, 0);
        }

        var item = items.eq(index),
            img = $('img', item)[0];

        if (img.complete || $(img).hasClass('broken')) setTimeout(kenburns, 0);
        else $(img).one('load'+kenburnsns+' error'+kenburnsns, kenburns);
    }

    function kenburnsswitch(i) {
        if (destaques.hasClass('transition') || i == index) return;
        destaques.addClass('transition');
        items.find('a, img').andSelf().off(kenburnsns).end().end()
        .eq(index).removeClass('showing').one(kenburnsend, 'img', function(){
            index = (isNaN(i) ? index + 1 : i) + len;
            index %= len;
            startkenburns();
        });
    }

    var sourcerects = [], destrects = [], focused = 0,
        destaques = $('#destaques').addClass('processed t3d')
                    .on('focusin', function(){
                        if (focused) return;
                        focused = 2;
                    })
                    .on('focusout', function(){
                        if (focused < 2) return;
                        focused = 0;
                    })
                    .on('keydown', function(e){
                        if (!focused) return;
                        switch (e.which) {
                            case 37: kenburnsswitch(index - 1);
                            case 39: kenburnsswitch(index + 1);
                        }
                    }),
        items = destaques.children('ul').find('li')
                .find('a:not(:first)').attr('tabindex', -1).end(),
        len = items.length,
        index = 0,
        bullets = $('<div id="destaques-bullets"></div>')
                  .prependTo(destaques)
                  .on('click', 'span', function(){ kenburnsswitch($(this).data('index')); });

    for (var i = 0; i < len; i++)
        bullets.append($('<span></span>').data('index', i));

    $.each([-1, 0, 1], function(){
        var x = this*1;
        $.each([-1, 0, 1], function(){
            var y = this*1;
            $.each([-1, 0, 1], function(){
                var s = this*1;
                if (x || y || s) {
                    sourcerects.push(rect(x, y, s));
                    destrects.push(rect(-x, -y, -s));
                }
            });
        });
    });

    startkenburns();
});

// slideshow da home - usando <canvas>

$(function(){
    if (!$('#destaques').length || !hardware || $('#destaques').hasClass('processed')) return;

    function rect(x, y, s) {
        s = (x && y ? [0.8, 0.9] : [0.9, 1])[1*!!(s+1)];
        x = (x+1)/2;
        y = (y+1)/2;
        return function(c, img) {
            var cw = c.width,
                ch = c.height,
                iw = img.naturalWidth,
                ih = img.naturalHeight,
                scale = s * Math.min(iw / cw, ih / ch),
                w = cw * scale, h = ch * scale;
            return {
                x: x * (iw - w),
                y: y * (ih - h),
                w: w, h: h
            };
        };
    }

    function startkenburns() {

        function kenburns() {
            var i, src, dst, s = {};
            do {
                i = Math.floor(Math.random() * sourcerects.length);
                src = sourcerects[i](c, img);
                dst = destrects[i](c, img);
            } while (src.x == dst.x
                  && src.y == dst.y
                  && src.w == dst.w
                  && src.h == dst.h
            );
            curranim.stop();
            ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, c.width, c.height);

            $('a', item).removeAttr('tabindex');
            items.not(item).removeClass('current').find('a').attr('tabindex', -1);
            $('span', bullets).removeClass('current');
            if (focused) {
                focused = 1;
                setTimeout(function(){
                    $('a', item).focus();
                    focused = 2;
                }, 0);
            }
            $('span', bullets).eq(index).addClass('current');
            item.addClass('current')
            .find(hideables).css('opacity', 0).fadeTo(500, 1, function(){
                if (complete2) return;
                complete2 = true;
                complete1 = false;
                destaques.removeClass('transition');
                curranim = $(src).animate(dst, {
                    easing: 'swing',
                    duration: 5000,
                    step: function(now, fx){
                        s[fx.prop] = now;
                        if (s.x === undefined
                         || s.y === undefined
                         || s.w === undefined
                         || s.h === undefined
                        ) return;
                        ctx.drawImage(img, s.x, s.y, s.w, s.h, 0, 0, c.width, c.height);
                        s = {};
                    },
                    complete: function(){
                        if (item.find('a').is(':hover, :focus'))
                            item.find('a').one('attentiondrop'+kenburnsns, kenburnsswitch);
                        else kenburnsswitch();
                    }
                });
            });
        }

        var item = items.eq(index),
            c = $('canvas', item)[0], ctx = c.getContext('2d'),
            img = $('img', item)[0];

        if (img.complete || $(img).hasClass('broken')) kenburns();
        else $(img).one('load'+kenburnsns+' error'+kenburnsns, kenburns);
    }

    function kenburnsswitch(i) {
        if (destaques.hasClass('transition')) return;
        destaques.addClass('transition');
        items.find('a, img').andSelf().off(kenburnsns).end().end()
        .eq(index).find(hideables).fadeTo(500, 0, function(){
            if (complete1) return;
            complete1 = true;
            complete2 = false;
            try {
                ctx.clearRect(0, 0, c.width, c.height);
            } catch (_) {}
            index = (isNaN(i) ? index + 1 : i) + len;
            index %= len;
            startkenburns();
        });
    }

    var sourcerects = [], destrects = [], focused = 0,
        destaques = $('#destaques').addClass('processed cnv')
                    .on('focusin', function(){
                        if (focused) return;
                        focused = 2;
                    })
                    .on('focusout', function(){
                        if (focused < 2) return;
                        focused = 0;
                    })
                    .on('keydown', function(e){
                        if (!focused) return;
                        switch (e.which) {
                            case 37: kenburnsswitch(index - 1);
                            case 39: kenburnsswitch(index + 1);
                        }
                    }),
        items = destaques.children('ul').find('li')
                .find('a').attr('tabindex', -1).end(),
        len = items.length,
        index = 0,
        bullets = $('<div id="destaques-bullets"></div>')
                  .prependTo(destaques)
                  .on('click', 'span', function(){ kenburnsswitch($(this).data('index')); }),
        hideables = 'canvas, div *',
        complete1 = false, complete2 = false, curranim = $('<span></span>');

    for (var i = 0; i < len; i++)
        bullets.append($('<span></span>').data('index', i));

    $.each([-1, 0, 1], function(){
        var x = this*1;
        $.each([-1, 0, 1], function(){
            var y = this*1;
            $.each([-1, 0, 1], function(){
                var s = this*1;
                if (x || y || s) {
                    sourcerects.push(rect(x, y, s));
                    destrects.push(rect(-x, -y, -s));
                }
            });
        });
    });

    items.find('img')
        .after($.canvas(destaques.cssWidth(), destaques.cssHeight()))
    .end()
    .first().find(hideables).css('opacity', 0);

    startkenburns();
});

}();

// players

$(function(){
    var
    wrap = $('<section id="player-bottom"></section>'),
    tab  = $('<h1 tabindex="0" role="button">Rádio <span></span></h1>').on('click keydown', function(e){
        var t = !wrap.hasClass('folded');
        if (e.type == 'keydown') switch (e.which) {
            case 38: t = false; break;
            case 40: t = true ; break;
            case 13:
            case 32: break;
            default: return;
        }
        wrap.toggleClass('folded', t);
        $('html').toggleClass('player-unfolded', !t);

        clearInterval(cycleint);
        cyclenum = 0;

        if (t) {
            cycleint = setInterval(cycleinfo, 5000);
            cycleinfo(true);
        }

        return false;
    }),
    cycleint = null,
    cyclenum = 0,
    online = null,
    info = $('<p></p>'),
    prog = $('<cite class="radioblastprog"></cite>'),
    dj   = $('<b class="radioblastdj"></b>'),
    desc = $('<p class="radioblastdescr"></p>').hover(toggledesc),
    pic  = $('<img class="radioblastavatar" alt="">').hover(toggledesc),
    song = $('<b class="radioblastsong"></b>'),
    play = $('<span tabindex="0" class="playerbtn" role="button">Tocar</span>').on('click keydown', function(e){
        if (e.type == 'keydown' && !(e.which == 13 || e.which == 32)) return;
        window.radioblast[window.radioblast.playing ? 'stop' : 'play']();
    }),
    menu = $('<ul>'+
        '<li id="pb-recados"><a href="#">Recados</a></li>'+
        '<li id="pb-chat"><a href="#">Chat</a></li>'+
        '<li id="pb-grade"><a href="#">Grade</a></li>'+
        '<li id="pb-opcoes" class="opcoes"><a href="#">Opções</a></li>'+
    '</ul>');

    $('<h2>Agora: </h2>').append(prog).appendTo(wrap);
    $('<p>Com </p>').append(dj).appendTo(wrap);
    wrap.append(desc).append(pic);
    $('<p>Tocando: </p>').append(song).appendTo(wrap);
    wrap.append(play).wrapInner('<div></div>');

    $('<header></header>').append(tab).append(info).prependTo(wrap);

    wrap.wrapInner('<div></div>').append(menu).appendTo('body').addClass('folded');

    function togglehidden() {
        var homeplayer = $('#srchtml5');
        if (homeplayer.length && homeplayer.is(':visible'))
            wrap.addClass('hidden');
        homeplayer.waypoint({
            offset: function(){
                var t = $(this);
                if (t.is(':hidden')) wrap.removeClass('hidden');
                return t.is(':visible') ? -t.cssHeight() + $('#topo').cssHeight() : '0%';
            },
            handler: function(e, dir){ wrap.toggleClass('hidden', dir == 'up'); }
        });
    }
    $.radioblastready(togglehidden);
    togglehidden();

    function toggledesc(e) {
        desc.toggleClass('hover', /^mouse(?:over|enter)$/.test(e.type));
    }

    function adjustdesc() {
        var off = desc.cssWidth() / parseFloat($('html').css('font-size')) - 1.9;
        desc.css('transform-origin-x', off+'rem');
    }

    setTimeout(function(){
        $(document).on('radioblastupdate', function(e, stats){
            adjustdesc();
            online = stats && stats.online;
            if (cycleint === null && wrap.hasClass('folded')) {
                cycleint = setInterval(cycleinfo, 5000);
                cycleinfo(true);
            }
        });
    }, 0);

    function cycleinfo(first) {
        if (online) {
            var s = '';
            switch (cyclenum) {
                case 0: s = '<b>Agora:</b> ' +prog.text(); break;
                case 1: s = '<b>DJ:</b> '    +dj.text  (); break;
                case 2: s = '<b>Música:</b> '+song.text(); break;
            }
            if (first) info.html(s);
            else $.textfade(info, s, false, true);
            cyclenum++;
            cyclenum %= 3;
        }
        else {
            cyclenum = 0;
            $.textfade(info, 'Rádio offline — '+(online === null ? 'Conexão perdida' : 'Não há DJ locutando'));
        }
    }
});
$.radioblastready(function(){

    var
    timer,
    nextprogs = $('#nextprogs'),
    progname = $('#blocoradio h2 cite'),
    nextprogslink = $('#nextprogs a');
    
    nextprogs.once(function(){
        nextprogs.removeClass('aside-unfolded');
        
        function fadeName(shrink) {
            progname.addClass('transparent')
            .one($.support.transitionend, function(){
                if (shrink)
                    progname.addClass('aside-unfolded');
                else
                    progname.removeClass('aside-unfolded');
                progname.removeClass('transparent');
            });
        }
        
        nextprogslink.on('attentiongrab', function(e){
            if (nextprogs.hasClass('aside-unfolded')) return;
            fadeName(true);
            nextprogs.addClass('aside-unfolded');
        });
        nextprogs.add('#blocoradio h2')
        .on('attentiongrab', function(e){
            clearTimeout(timer);
        })
        .on('attentiondrop', function(e){
            if (!nextprogs.hasClass('aside-unfolded')) return;
            clearTimeout(timer);
            timer = setTimeout(function(){
                fadeName();
                nextprogs.removeClass('aside-unfolded');
            }, 500);
        });
    });

});
$(function(){

var
ANIMSPD = 200,

bloco    = $('#blocoradio'),
progname = $('.radioblastprog'),
dj       = $('.radioblastdj'),
descr    = $('.radioblastdescr'),
song     = $('.radioblastsong'),
avatar   = $('.radioblastavatar').on('load error', function(){$(this).removeClass('transparent')}),
next     = $('#nextprogs dl'),
ouvintes = $('#stats b:eq(0)'),
recorde  = $('#stats b:eq(1)'),
pastpane = $('#pastsongs').addClass('js'),
pastlist = $('#pastsongs li'),
online   = false,
offlinep = $('#playermain').prepend('<div id="playeroffline"><h2>'+Drupal.settings.radioblast.offtitle+'</h2><div></div></div>').children('#playeroffline').hide(),
offlinec = offlinep.children().css('opacity', 0),
cursongts = 0,
curprogts = -1,

gettimeout,
first = true,
peak = parseInt(recorde.text()),
pstimer = null;

function revealpastpane() {
    setTimeout(function(){
        clearTimeout(pstimer);
        pastpane.addClass('active');
    }, 0);
}
song.css('cursor','pointer').on('click', revealpastpane);
pastpane.on('attentiongrab', revealpastpane);
$('#song').on('attentiongrab', function(){
    clearTimeout(pstimer);
});
$('#song, #pastsongs').on('attentiondrop', function(){
    if (pastpane.is(':hidden')) return true;
    clearTimeout(pstimer);
    pstimer = setTimeout(function(){
        pastpane.removeClass('active');
    }, 500);
});

var textfade = $.textfade = function(sel, text, force, html) {
    var ret = false, met = html ? 'html' : 'text';
    $(sel).each(function() {
        var $sel = $(this);
        if (!first && $sel.is(':visible') && ($sel[met]() != text || force)) {
            $sel
            .addClass('transparent')
            .one($.support.transitionend, function(){
                $sel[met](text).removeClass('transparent');
            });
            ret = true;
        }
        else $sel[met](text);
    });
    return ret;
}

function textanim(sel, val) {
    $(sel).text(val);
}

function textdrop(sel, text, force, marquee) {
    $(sel).each(function() {
        var $sel = $(this),
            newtext = $sel.text() != text;
        if (!first && $sel.is(':visible') && (newtext || force) && Modernizr.csstransitions) {
            var overflow = $sel.css('overflow');
            $sel
            .css('overflow', 'hidden')
            .lockCss('height')
            .append('<div>'+text+'</div>')
            .animate({scrollTop:$sel.cssHeight()}, ANIMSPD, 'swing', function(){
                $sel
                .scrollTop(0)
                .css('overflow', overflow)
                .text(text);
                if (marquee) $sel.marquee(3000, 3000);
            });
        }
        else if (newtext) {
            $sel.text(text);
            if (marquee) $sel.marquee(3000, 3000);
        }
    });
}

function attrfade(sel, attr, value) {
    $(sel).each(function() {
        var $sel = $(this),
            isimg = this.tagName == 'IMG' && attr == 'src';
        if ($sel.attr(attr) == value) return true;

        if (!first && $sel.is(':visible') && Modernizr.csstransitions)
            $sel
            .addClass('transparent')
            .one($.support.transitionend, function(){
                $sel.attr(attr, value).removeClass('transparent');
            });
        else {
            if (first && isimg) $sel.addClass('transparent');
            $sel.attr(attr, value);
        }
    });
}

function formatHMS(timestamp) {
    var hr = '??',
        mn = '??',
        sc = '??',
        json;
    if (!isNaN(timestamp)) {
        timestamp = new Date(parseInt(timestamp+'000') - Drupal.settings.timezone * 60000);
        hr = timestamp.getUTCHours();
        mn = timestamp.getUTCMinutes();
        sc = timestamp.getUTCSeconds();
        hr = (hr < 10 ? '0' : '') + hr;
        mn = (mn < 10 ? '0' : '') + mn;
        sc = (sc < 10 ? '0' : '') + sc;
        json = timestamp.toJSON();
    }
    return [hr,mn,sc,json];
}

function setOffline(xhr) {
    clearTimeout(gettimeout);

    $('div', offlinep).empty().html('<p>'+Drupal.settings.radioblast[xhr === false ? 'nodjmsg' : 'offmsg'].join('</p><p>')+'</p>');

    if (first) {
        offlinep.show();
        offlinec.css('opacity', 1);
    }
    else if (online) {
        if (offlinec.is(':animated'))
            offlinec.stop().fadeTo(ANIMSPD, 1);
        else offlinep.stop().fadeIn(ANIMSPD, function(){
            offlinec.fadeTo(ANIMSPD, 1);
        });
    }
    online = false;
    $('#playermain').children().not(offlinep).disableFocus('offlinepane');

    if (first) first = false;
}

function setOnline() {
    if (online || bloco.is('hidden')) return;
    online = first = true;
    if (offlinep.is(':animated'))
        offlinep.fadeOut(ANIMSPD);
    else offlinec.stop().fadeTo(ANIMSPD, 0, function(){
        offlinep.fadeOut(ANIMSPD);
    });
    $('#playermain').enableFocus('offlinepane');
}

function template(next) {
    return '<dt><cite>'+next[1]+'</cite></dt>'+
    '<dd><ul>'+
        '<li>às '+next[3]+'h</li>'+
        '<li>'+next[2]+'</li>'+
        '<li class="dj">'+next[0]+'</li>'+
    '</ul></dd>';
}

function refreshRadioStats(stats) {
    if (!(stats && stats.online)) {
        setOffline(!stats);
        return;
    }
    setOnline();
    clearTimeout(gettimeout);

    var pastsongs = stats.songhistory,
        currsong  = pastsongs[0][1],
        currtime  = pastsongs[0][0],
        force     = cursongts != currtime,
        nextprogs = stats.nextprogs.slice(1);

    peak = Math.max(stats.peak, peak);

    textdrop(song, currsong, force, true);
    cursongts = currtime;

    textanim(ouvintes, stats.listeners);
    textanim(recorde, peak);

    textfade(dj, stats.dj);
    attrfade(avatar, 'src', stats.avatar);

    textfade(descr, stats.description);

    $.each(pastsongs.slice(1), function(i){
        if (i >= pastlist.length) return false;

        var songtime = formatHMS(this[0]),
            songname = this[1],
            item = pastlist.eq(pastlist.length - i - 1);

        textdrop($('b', item), songname, force);
        textdrop($('time', item).attr('datetime', songtime[3]), songtime[0]+':'+songtime[1], force);
    });

    function updateProgs() {
        progname.text(stats.program);
        curprogts = nextprogs[0][3];
        next.empty().html(template(nextprogs[0])+template(nextprogs[1]));
    }

    if (first || !Modernizr.csstransitions) {
        updateProgs();
        first = false;
    }
    else if (curprogts != nextprogs[0][3]) {
        textfade(progname.not('#blocoradio h2 cite'), stats.program);
        var unfolded = $('#nextprogs').hasClass('aside-unfolded');
        progname
        .filter('#blocoradio h2 cite')
        .closest('h2')
        .css('margin-left', next.closest('aside').cssWidth()-300);
        if (unfolded) {
            next.append(template(nextprogs[1]))
            .find('cite:first')
            .addClass('novoagora');
        }
        else {
            next
            .find('cite:first')
            .addClass('transparent')
            .one($.support.transitionend, function(e){
                e.stopPropagation();
                $(this).removeClass('transparent').addClass('novoagora');
            });
        }
        next.closest('aside')
        .addClass(unfolded ? 'novoagora2' : 'novoagora')
        .one($.support.transitionend, function(){
            next.closest('aside')
            .add(progname.closest('h2'))
            .addClass('notransition');
            setTimeout(function(){
                next.closest('aside')
                .removeClass('novoagora novoagora2');
                progname.closest('h2').resetCss();
                setTimeout(function(){
                    next.closest('aside')
                    .add(progname.closest('h2'))
                    .removeClass('notransition');
                }, 0);
            }, 0);
            updateProgs();
        });
    }

    if (first) first = false;
}

function doitoit() {
    $.ajax({
        url      : 'http://ouvir.radioblast.com.br/radioinfo.json',
        success  : function(d) { return $.event.trigger('radioblastupdate', d); },
        error    : function() { return $.event.trigger('radioblastupdate', null); },
        dataType : $.support.cors ? 'json' : 'jsonp',
        cache    : false,
        timeout  : 10000
    });
}
var statsint = null;

$(document)
.on('radioblastupdate', function(e, stats){ refreshRadioStats(stats); })
.on('radioblastplay radioblaststop', function(e){
    var playing = e.type == 'radioblastplay';
    $('.playerbtn').toggleClass('playing', playing);
    clearInterval(statsint);
    if (!playing) {
        statsint = setInterval(doitoit, 15000);
        doitoit();
    }
});

$('#srchtml5 a')
.on('click', function(){
    window.radioblast[window.radioblast.playing ? 'stop' : 'play']();
});

window.rbplayerprefs = {
    autostart: 0,
    cookietime: -1,
    onplay: function(f) { return $.event.trigger('radioblastplay', f); },
    onstop: function(f) { return $.event.trigger('radioblaststop', f); },
    onupdate: function(d) { return $.event.trigger('radioblastupdate', d); },
    callback: function(s) { $('body').append(s); }
};

$.getScript('http://p.rbla.st.s3.amazonaws.com/_faceless/player-light-m.js');
});

// Twitter

$.radioblastready(function(){
$('#twitter').once(function(){
    function cycletweets(tweets) {
    
        var
        INTERVAL = 5000,
        interval,
    
        tweetpane =
        $('#twitter > ul')
        .on('attentiongrab attentiondrop', function(e){
            clearInterval(interval);
            if (e.type == 'attentiondrop') interval = setInterval(cycle, INTERVAL);
        }),
    
        index = false;
    
        function post_transition(e) {
            if (e && e.target != this) return true;
            var current = tweets
            .detach()
            .removeClass('slideup slidedown')
            .addClass('hidden')
            .eq(index).prependTo(tweetpane);
            setTimeout(function(){
                current.removeClass('hidden');
            }, 0);
        }
        function cycle(back) {
            if (tweetpane.is(':hidden')) {
                clearInterval(interval);
                return;
            }
            if (index === false) {
                index = 0;
                post_transition();
                return;
            }
            index = index + (back === true ? -1 : 1);
            if (index < 0) index += tweets.length;
            else index %= tweets.length;
            if (Modernizr.csstransitions)
                tweetpane
                .children(':first').removeClass('slideup slidedown')
                .addClass('slide' + (back ? 'up' : 'down'));
            else post_transition();
            return false;
        }
        tweets.css('display', tweets.css('display'));
        tweetpane=tweetpane/*.after('<a id="tweetsobe" href="#">Sobe</a><a id="tweetdesce" href="#">Desce</a>')*/.html('');
        /*$('#tweetsobe').click(function(){ return cycle(true); });
        $('#tweetdesce').click(cycle);*/
        if (Modernizr.csstransitions) {
            tweetpane
            .on($.support.transitionend, 'li', post_transition);
        }
        interval = setInterval(cycle, INTERVAL);
        cycle();
    }
    
    function format_interval(timestamp, granularity) {
        var units = {'1 semana|@count semanas' : 604800000, '1 dia|@count dias' : 86400000, '1 hora|@count horas' : 3600000, '1 minuto|@count minutos' : 60000, '1 segundo|@count segundos' : 1000},
            output = '',
            value;
        for (var key in units) {
            value = units[key];
            key = key.split('|');
            if (timestamp >= value) {
                var val = Math.floor(timestamp / value);
                output += (output ? ' ' : '') + val >= 2 ? key[1].replace('@count', ''+val) : key[0];
                timestamp %= value;
                granularity--;
            }
    
            if (granularity == 0) {
                break;
            }
        }
        return output ? output : '0 segundo';
    }
    
    var tweets = $('#twitter > ul').html('<li><q>&nbsp;</q></li>'),
    user = 'radioblast';
    
    $.get('http://api.twitter.com/1/statuses/user_timeline.json', {
        screen_name: user,
        include_rts: true,
        include_entities: true,
        contributor_details: true
    }, function(data, status){
        var tweetlist = $(), now = new Date();
        $('#twitter .overlay').remove();
        $.each(data, function() {
            var
            tweet = this.retweeted_status || this,
            turl = 'http://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id,
            pdate = new Date(this.created_at),
    
            text = tweet.text,
            replacements = [];
            $.each(tweet.entities, function(key, list){
                $.each(list, function(i, obj){
                    var str = text.substring(obj.indices[0], obj.indices[1]);
                    switch(key) {
                        case 'media':
                        case 'urls':
                            str = '<a href="'+obj.expanded_url+'">'+obj.display_url+'</a>';
                        case 'user_mentions':
                            str = '<a href="http://twitter.com/intent/user?screen_name='+obj.screen_name+'">'+str+'</a>';
                            break;
                        case 'hashtags':
                            str = '<a href="http://twitter.com/search?q='+escape(str)+'">'+str+'</a>';
                            break;
                    }
                    replacements.push({
                        start: obj.indices[0],
                        end: obj.indices[1],
                        repl: str
                    });
                });
            });
            replacements.sort(function(a, b){
                return b.start - a.start;
            });
            $.each(replacements, function(i, obj){
                text = text.splice(obj.start, obj.end, obj.repl);
            });
    
            text = $('<q cite="'+turl+'">'+text+'<span class="q-after"></span></q>')
                .toggleClass('retweet', !!this.retweeted_status);
            if (isNaN(pdate)) pdate = new Date(this.created_at.replace(/(?= [+-]\d{4})/, 'UTC'));
            tweetlist = tweetlist.add($('<li></li>')
            .append(text)
            .append($('<p></p>')
            .append(this.retweeted_status ? 'RT <a href="http://twitter.com/intent/user?screen_name='+tweet.user.screen_name+'">@'+tweet.user.screen_name+'</a> · ' : '')
            .append($('<time></time>').attr('datetime', pdate.toJSON()).html('<a href="'+turl+'">Há '+format_interval(now - pdate, 1)+'</a>'))
            ));
        });
        cycletweets(tweetlist);
    }, /*$.support.cors ? 'json' : */'jsonp');
});
});

// auxiliador para área do top blast e podcasts

$.radioblastready(function(){
    function toggleClasses(reset) {
        var items = $(this).closest('ol, ul').children();
        items
        .filter('.hover').removeClass('hover').end()
        .filter(reset ? ':first' : this).addClass('hover');
    }

    function resetClasses() { toggleClasses.call(this, true); }

    function setup() {
        var t = null;
        $(this)
        .addClass('hover')
        .on('attentiongrab attentiondrop', 'li', function(e){
            clearTimeout(t);
            setTimeout($.proxy(function(){$(this).scrollTop(0)}, this), 0);
            if (e.type == 'attentiongrab') toggleClasses.apply(this);
            else t = setTimeout($.proxy(resetClasses, this), 2000);
        })
        .find('li:first-child').addClass('hover');
    }

    $('#topblast ol, #podcasts ul').once(setup);
});

// player personalizado para arquivos de música e vídeo

$.radioblastready(function(e, ctx){
    function success(media, original, mediaobj) {
        var src,
            link = $('<a></a>')
                   .attr('href', media.src)
                   .text('Download'),
            wrap = mediaobj.container.addClass('downloadable');

        if (mediaobj.isVideo) {
            if (media.pluginType == 'youtube'
            || /^https?:\/\/(?:www\.)?youtu(?:\.be|be\.com)/.test(media.src)) {
                wrap.removeClass('downloadable');
                link.text('Assistir no YouTube');
            }
            else if (media.pluginType == 'vimeo'
            || /^https?:\/\/(?:www\.)?vimeo\.com/.test(media.src)) {
                wrap.removeClass('downloadable');
                link.text('Assistir no Vimeo');
            }
        }
        else {
            mediaobj.setPlayerSize('40rem', '3.5rem');
        }
        wrap.append(link);
    }

    function error(mediaobj) {
        var
        container = $(mediaobj).closest('.mejs-container').addClass('downloadable'),
        link = $('.me-cannotplay', container)
        .find('img')
        .appendTo('.me-cannotplay', container)
        .end().end()
        .append('<span>Não foi possível carregar o ' +
            ($(mediaobj).is('video') ? 'vídeo' : 'áudio')
        + '.</span>')
        .find('a')
        .appendTo(container);
        if (/^https?:\/\/(?:www\.)?youtu(?:\.be|be\.com)/.test(link.attr('href'))) {
            wrap.removeClass('downloadable');
            link.text('Assistir no YouTube');
        }
        else if (/^https?:\/\/(?:www\.)?vimeo\.com/.test(link.attr('href'))) {
            wrap.removeClass('downloadable');
            link.text('Assistir no Vimeo');
        }
        else link.text('Download');
    }

    mejs.players = [];

    var av = $('audio, video', ctx),
        top = av.filter('#topblast audio'),
        pod = av.filter('#podcasts audio');
    av.not(top).not(pod).mediaelementplayer({
        audioHeight: 35,
        audioVolume: 'horizontal',
        videoVolume: 'vertical',
        success: success, error: error
    });
    top.mediaelementplayer({
        features: ['progress', 'playpause'],
        audioWidth: '100%',
        audioHeight: 35,
        audioVolume: 'vertical',
        success: success, error: error
    });
    pod.mediaelementplayer({
        audioWidth: '100%',
        audioHeight: 35,
        audioVolume: 'vertical',
        success: success, error: error
    });
});

// calendário

$.radioblastready(function(){ $('#calendario').once(function(){
    function updatedaypos() {
        $('h2', calitems).removeClass('hidden').each(function(){
            var t = $(this),
                div = t.closest('div'),
                pos = div.position().left;

            if (pos > 0) {
                dummyday.text('');
                return false;
            }
            t.addClass('hidden');

            var dw  = div.cssWidth();
            if (pos + dw <= 0) return true;

            dummyday
            .css('opacity', 1 - Math.min(1, 1.75 * Math.max(0,
                1 - (pos + dw) / $('a', div).cssWidth()
            )))
            .text(t.text());
            return false;
        });
    }

    $(window).off('.calendario').on('resize.calendario', updatedaypos);

    var
    calitems = $('#calendaritems').on('scroll', updatedaypos),
    dummyday = $('<span class="dummyday" aria-hidden="true"></span>').insertBefore(calitems);
    $('#calendario > table > tbody').on('click', 'a', function(e){
        e.preventDefault();
        var offset = calitems.scrollLeft(),
            div = $($(this).attr('href')).addClass('hilite'),
            pos = div.position().left;
        calitems.animate({scrollLeft: offset + pos}, 200, function(){
            div.removeClass('hilite');
        });
    });

    var d = new Date(
        $('#calendario > table').data('month') + '-' +
        $('#calendario td.today').text()
    );

    $('time', calitems).each(function(){
        var t = $(this);
        if (d > new Date(t.attr('datetime'))) return true;
        calitems.scrollLeft(0).scrollLeft(t.closest('div').position().left);
        return false;
    });

    var monthsel = $('<input type="month" id="calselect">');
    if (monthsel.prop('type') === 'month') {
        monthsel.on('change', function(){console.log(this.value)});
        $('#calendario > table > caption').prepend(monthsel);
    }

    $('#calendaritems').scrollify();
})});

// syntaxhighlighter

$(function(){

    function path() {
      var args = arguments,
          result = [];

      for(var i = 0; i < args.length; i++)
          result.push(args[i].replace('@', 'layout/syntaxhighlighter/scripts/'));

      return result
    };

    if (window.SyntaxHighlighter) {
        window.SyntaxHighlighter.autoloader.apply(null, path(
          'applescript            @shBrushAppleScript.js',
          'actionscript3 as3      @shBrushAS3.js',
          'bash shell             @shBrushBash.js',
          'coldfusion cf          @shBrushColdFusion.js',
          'cpp c                  @shBrushCpp.js',
          'c# c-sharp csharp      @shBrushCSharp.js',
          'css                    @shBrushCss.js',
          'delphi pascal          @shBrushDelphi.js',
          'diff patch pas         @shBrushDiff.js',
          'erl erlang             @shBrushErlang.js',
          'groovy                 @shBrushGroovy.js',
          'java                   @shBrushJava.js',
          'jfx javafx             @shBrushJavaFX.js',
          'js jscript javascript  @shBrushJScript.js',
          'perl pl                @shBrushPerl.js',
          'php                    @shBrushPhp.js',
          'text plain             @shBrushPlain.js',
          'py python              @shBrushPython.js',
          'ruby rails ror rb      @shBrushRuby.js',
          'sass scss              @shBrushSass.js',
          'scala                  @shBrushScala.js',
          'sql                    @shBrushSql.js',
          'vb vbnet               @shBrushVb.js',
          'xml xhtml xslt html    @shBrushXml.js'
        ));
        window.SyntaxHighlighter.all();
    }
});

}(window);