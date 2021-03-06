// vars
var le_scroll = null, siriWave, counter;
var preload = new createjs.LoadQueue();
var sortie_ok, ajax_ok, contenu_nouvelle_page, lien_en_cours, plus_long, raf, raf_pixi_home, raf_pixi_menu, raf_pixi_single, raf_chargement, le_raf_about, raf_about;
var mousePos = {}, ancien_delta = 0;

var displacementSprite,
    displacementSprite2,
    stage,
    texture2,
    displacementFilter,
    displacementFilter2,
    renderer,
    raf1,
    links,
    hovers,
    lien_bas,
    echelle_scale,
    le_delta_menu,
    scroll_menu_open,

    renderer_menu,
    displacementFilter3,
    displacementSprite3,
    stage_menu;

var currentMousePos = { x: window.innerWidth/2, y: window.innerHeight/2 };

var loader;

var listenCursor = false; // true
var vitesse = 0;
var total_slide;
var current_slide = 0;
var lethargy = new Lethargy();
var bloque_action = true;
var attributs = {}, attributs2 = {}, attributs3 = {};

var delta_menu = 0;
var delta_scroll = 0;
var intensite, hauteur_menu, marges, expression, hauteur_marge, percent_cursor, entrees_menu, hauteur_entree;



document.addEventListener("mousemove", function(event){

    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;

});



document.addEventListener("click", function(event){

    if(event.target.classList.contains('change_projet')){
        change_projet(event.target);
    }else if(event.target.classList.contains('to_next') && bloque_action === false){
        next_slide();
    }else if(event.target.classList.contains('to_prev') && bloque_action === false){
        prev_slide();
    }else if(event.target.classList.contains('all_works')){

        document.querySelectorAll('.all_works').forEach(
            x=> x.classList.toggle('actif')
        );

        if( document.querySelector('.all_works').classList.contains('actif') ){

            if ( le_scroll !== null){
                le_scroll.off(onscroll);
            }else{
                scroll_menu_open = window.pageYOffset;
            }
            document.querySelectorAll('.devant.point, .devant .point').forEach(
                x => x.classList.add('noir')
            );

            document.getElementById('menu').style.display = 'block';
            TweenMax.to('.trait1', 0.2, {scaleY:0, delay:0.2, ease: Power2.easeIn});

            TweenMax.to('#main', 0.2, {opacity:0, ease: Power2.easeIn, onComplete:function(){
                    if(isMobile()){
                        window.scrollTo(0, 0);
                        document.getElementById('main').classList.add('bloque');
                        document.querySelector('body').classList.add('temp');
                    }
                }});
            TweenMax.to('#menu', 0.2, {opacity:1, delay:0.2, ease: Power2.easeOut});

            hauteur_menu = document.getElementById('le_menu').clientHeight;
            marges = window.innerHeight / 2 - 70;
            hauteur_marge = Math.round((100 - (hauteur_menu - 2*marges)* 100 / hauteur_menu) / 2 * 100)/100;
            entrees_menu = document.getElementById("le_menu").querySelectorAll("li").length;
            hauteur_entree = Math.round((100 - 2*hauteur_marge) / entrees_menu * 100)/100;

            stage_menu.addChild(displacementSprite3);
            stage_menu.addChild(image_menu0);
            image_menu0.alpha = 1;

            cancelAnimationFrame(raf_pixi_home);
            cancelAnimationFrame(raf_pixi_single);

            pixi_menu();

        }else{

            if ( le_scroll !== null){ le_scroll.on(onscroll); }

            if( document.querySelector('body').classList.contains('home') ){
                document.querySelectorAll('.devant.point, .devant .point').forEach(
                    x => x.classList.remove('noir')
                );
            }

            TweenMax.to('#menu', 0.2, {opacity:0, ease: Power2.easeIn, onComplete:function(){
                    document.getElementById('menu').style.display = 'none';
                    if(isMobile()){
                        document.getElementById('main').classList.remove('bloque');
                        document.querySelector('body').classList.remove('temp');
                        window.scrollTo(0, scroll_menu_open);
                    }
                }});
            TweenMax.to('#main', 0.2, {opacity:1, delay:0.2, ease: Power2.easeOut});

            TweenMax.to('.trait1', 0.2, {scaleY:1, delay:0.2, ease: Power2.easeIn});

            stage_menu.removeChildren();
            cancelAnimationFrame(raf_pixi_menu);

            if( document.querySelector('body').classList.contains('home') ){ pixi_home(); }
            else if( document.querySelector('body').classList.contains('single') ){ pixi_single(); }
        }
    }
});


// single hover

// document.getElementById('to_next_proj').addEventListener("mouseenter", function( event ) {

//     random = [];
//     document.querySelectorAll('#to_next_proj span').forEach(x=> random.push(x));
//     random.sort(function(){ return 0.5-Math.random(); });

//     TweenMax.staggerTo(random, 0.2, {opacity: 0, ease: Power2.easeIn, onComplete:function(e){
//         document.getElementById('to_next_proj').innerHTML = document.getElementById('to_next_proj').getAttribute('data-next');
//     }}, 0.05);

//     TweenMax.to('#inner_nom_projet', 0.2, {x: (document.getElementById('nom_projet').clientWidth + 10) / 2 + 'px', delay:0.2, ease:Power2.easeInOut});
//     TweenMax.staggerTo('.stag', 0.4, {opacity: 1, delay:0.2, ease: Power2.easeOut}, -0.02);
// });



// document.getElementById('to_next_proj').addEventListener("mouseleave", function( event ) {
//     TweenMax.staggerTo('#to_next_proj span', 0.2, {opacity: 0, ease: Power2.easeIn, onComplete:function(e){
//         this.target.classList.remove('blanc');
//         TweenMax.to(this.target, 0.2, {opacity: 1, ease: Power2.easeOut});
//     }}, 0.05);
//     TweenMax.to('#inner_nom_projet', 0.2, {x: '0px', delay:0.2, ease:Power2.easeInOut});
//     TweenMax.staggerTo('.stag', 0.4, {opacity: 0, delay:0.2, ease: Power2.easeOut}, 0.02);
// });



var supportsWheel = false;
function scrollEvent (e) {

    if (e.type == "wheel"){ supportsWheel = true; }
    else if (supportsWheel){ return; }

    var delta = (e.deltaY || -e.wheelDelta || e.detail) || 1;

    if( lethargy.check(e) !== false &&
        bloque_action === false &&
        !document.querySelector('.all_works').classList.contains('actif') &&
        document.querySelector('body').classList.contains('home')
    ){
        if(delta > 0 ){
            next_slide();
        }else if(delta < 0){
            prev_slide();
        }

    }
}

/* Add the event listeners for each event. */
document.addEventListener('wheel', scrollEvent);
document.addEventListener('mousewheel', scrollEvent);
document.addEventListener('DOMMouseScroll', scrollEvent);



// resize
window.addEventListener("resize", resize);
function resize(){
    if(le_scroll !== null){
        le_scroll.resize();
    }else{
        document.getElementById('about').style.top = window.innerHeight/2 + 'px';
        document.getElementById('contact').style.top = window.innerHeight/2 + 'px';
    }


}


// document ready vanilla
document.addEventListener("DOMContentLoaded", function() {


    //--------------//
    // PRELOAD PART //
    //--------------//
    //preload.loadFile('http://localhost:8888/higherground/dev/wp-content/themes/higherground/img/img_home.jpg');
    preload.on("progress", handleOverallProgress);
    preload.on("complete", handleComplete);
    function handleOverallProgress(event) {
        //console.log(1 - event.progress);
    }
    function handleComplete(event) {

    }


    //--------------//
    // PROCESS AJAX //
    //--------------//
    // var $main = $("#main"),

    // appel?? ?? chaque lancement d'une page
    var init = function() {

            sortie_ok = false;
            ajax_ok = false;
            lien_en_cours = false;
            delta_menu = 0;
            delta_scroll = 0;
            vitesse = 0;
            lien_bas = false;
            once_play = false;
            TweenMax.set('#main, #le_menu, #pixi_menu', { opacity:1 });
            TweenMax.set('#main', {clearProps: "y"});
            TweenMax.to('.trait1', 0.2, {scaleY:1, ease: Power2.easeIn});
            document.getElementById('menu').style.display = 'none';
            document.querySelector('.all_works').classList.remove('actif');

            if( document.querySelector('body').classList.contains('is-loading') ){
                document.querySelector('.is-loading').classList.remove('is-loading');
            }

            // quand clique on lien
            links = document.querySelectorAll('a');

            links.forEach(function (link) {
                link.removeEventListener('click', onClick);
            });

            function onClick (event) {
                if( !event.target.classList.contains('externe') ){
                    event.preventDefault();

                    if( lien_en_cours === false ){
                        lien_en_cours = true;
                        var href = this.getAttribute('href');

                        if(event.target.classList.contains('lien_bas')){
                            lien_bas = true;
                        }

                        //if(href.indexOf(document.domain) > -1 || href.indexOf(':') === -1) {
                        history.pushState({}, '', href);
                        loadPage(href);
                        le_raf_chargement();

                        //le_scroll.off(onscroll);

                        return false;
                        //}
                    }else{ return false; }
                }
            }

            links.forEach(function (link) {
                link.addEventListener('click', onClick);
            });

            animations();
        },
        // quand get() termin??
        ajaxLoad = function(html) {
            contenu_nouvelle_page = html;
            ajax_ok = true;
        },
        // animations d'entr??e
        animations = function(){

            if(window.innerWidth < 768){
                document.querySelectorAll('#le_menu li').forEach( x => x.classList.remove('actif') );
            }

            if (isMobile()){
                window.scrollTo(0, 0);
                document.getElementById('main').classList.remove('bloque');
            }

            if( document.querySelector('body').classList.contains('home') ){

                document.querySelectorAll('.point').forEach( x => x.classList.remove('noir') );


                hovers = document.querySelectorAll('.change_projet');
                hovers.forEach(function (hover) {
                    hover.addEventListener("mouseenter", onHover);
                });
                hovers.forEach(function (hover) {
                    hover.addEventListener("mouseleave", offHover);
                });

                current_slide = 0;
                total_slide = 0;

                renderer=PIXI.autoDetectRenderer(
                    window.innerWidth, window.innerHeight, {transparent:!0}
                );
                document.getElementById('inner_canvas').appendChild(renderer.view);

                stage = new PIXI.Container();
                loader = new PIXI.loaders.Loader();

                document.querySelectorAll('#images div').forEach(setDimensions);


                //displacement 1
                displacementSprite=PIXI.Sprite.fromImage(directory_uri+"/img/gradient4.png"); //gradient4_bis //gradient4
                displacementSprite.texture.baseTexture.wrapMode=PIXI.WRAP_MODES.CLAMP; //REPEAT // MIRRORED_REPEAT //CLAMP
                displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);


                //displacement 2
                displacementSprite2=PIXI.Sprite.fromImage(directory_uri+"/img/gradient_large.png");
                displacementSprite2.texture.baseTexture.wrapMode=PIXI.WRAP_MODES.REPEAT;
                displacementFilter2 = new PIXI.filters.DisplacementFilter(displacementSprite2);


                //settings displacement1
                //intensit??
                displacementFilter.scale.x = 50;
                displacementFilter.scale.y = 0;
                //centre pour curseur
                displacementSprite.pivot.x = 256;
                displacementSprite.pivot.y = 256;
                //echelle x/y
                displacementSprite.scale.x=0.2;






                //settings displacement2
                //intensit??
                displacementFilter2.scale.x = 0;
                displacementFilter2.scale.y = 0;
                //echelle x/y
                displacementSprite2.scale.x=0.8;
                //displacementSprite2.anchor.x = 1;


                stage.addChild(displacementSprite);
                stage.filters=[displacementFilter, displacementFilter2];

                loader.load((loader, resources) => {
                    bloque_action = false;
                    if( !document.querySelector('.all_works').classList.contains('actif') ){ pixi_home(); }
                    next_slide();
                    document.getElementById('progress').style.display = "none";

                });

            }else if( document.querySelector('body').classList.contains('page-template-about') ){

                document.getElementById('progress').style.display = "none";
                document.querySelectorAll('.point').forEach( x => x.classList.add('noir') );

                //document.getElementById('volet1').classList.add('ouvert');
                //document.querySelector('.intro').classList.add('ouvert');

                TweenMax.to('.fond_intro', 1.2, {scaleX:1, ease:Power4.easeOut});
                random = [];
                document.querySelectorAll('.random').forEach(x=> random.push(x));
                random.sort(function(){ return 0.5-Math.random(); });
                TweenMax.staggerFromTo(random, 1,{x:'-24px'}, {x: '0px', opacity: 1, delay:0.6, ease: Power2.easeOut}, 0.1);


                if(!isMobile()){
                    if(le_scroll !== null){le_scroll.destroy();}
                    le_scroll = null;

                    le_scroll = new global_custom2.default({
                        preload: true,
                        native: false,
                        section: document.querySelector('.vs-section'),
                        divs: document.querySelectorAll('.vs-div'),
                        vs : { mouseMultiplier: 0.4 }
                    });

                    le_scroll.init();
                }


                TweenMax.to('#main', 0.4, {backgroundColor:"#EFEFEF", ease:Power2.easeInOut});

                TweenMax.to('#inner_svg', 1, {opacity:1, ease:Power2.easeIn});
                TweenMax.fromTo('#inner_svg', 2, {rotation:140}, {rotation: 0, ease: Power2.easeOut});
                TweenMax.fromTo('#inner_svg img', 2, {rotation:-140}, {rotation: 0, ease: Power2.easeOut, onComplete:function(){
                        raf_about();
                    }});

            }else if( document.querySelector('body').classList.contains('single') ){

                if(window.innerWidth < 768){
                    document.querySelectorAll('#le_menu li').forEach(
                        x => {
                            if( document.querySelector('body').classList.contains( x.getAttribute('data-id') )){
                                x.classList.add('actif');
                            }
                        }
                    );
                }


                document.querySelectorAll('.point').forEach( x => x.classList.add('noir') );


                if(!isMobile()){

                    document.getElementById('to_next_proj').addEventListener("mouseover", onHoverNext);
                    document.getElementById('to_next_proj').addEventListener("mouseout", offHoverNext);


                    if(le_scroll !== null){le_scroll.destroy();}
                    le_scroll = null;

                    le_scroll = new global_custom2.default({
                        preload: true,
                        native: false,
                        section: document.querySelector('.vs-section'),
                        divs: document.querySelectorAll('.vs-div'),
                        vs : { mouseMultiplier: 0.4 }
                    });

                    le_scroll.init();
                }else{
                    document.getElementById('to_next_proj').innerHTML = document.getElementById('to_next_proj').getAttribute('data-next');
                    TweenMax.set('#inner_nom_projet', {x: (document.getElementById('nom_projet').clientWidth + 10) / 2 + 'px'});
                    TweenMax.set('#nom_projet .stag', {opacity:1});

                }

                var hauteur;
                if(window.innerWidth > 767){
                    hauteur = 0.57*window.innerWidth + 20;
                    renderer=PIXI.autoDetectRenderer(
                        window.innerWidth, (0.57*window.innerWidth + 20), {transparent:!0}
                    );
                }else{
                    hauteur = window.innerWidth + 20;
                    renderer=PIXI.autoDetectRenderer(
                        window.innerWidth, (window.innerWidth + 20), {transparent:!0}
                    );
                }
                document.getElementById('cover').appendChild(renderer.view);


                stage = new PIXI.Container();

                loader = new PIXI.loaders.Loader();

                //document.querySelectorAll('#images div').forEach(setDimensions);
                var image = new PIXI.Sprite( PIXI.Texture.fromImage(document.getElementById('cover').getAttribute('data-img')) );

                loader.add("image", document.getElementById('cover').getAttribute('data-img'));

                var img = new Image();
                img.src = document.getElementById('cover').getAttribute('data-img');

                img.onload = function() {
                    var width = this.width;
                    var height = this.height;

                    var ratio_img = width/height;
                    var ratio_fenetre = window.innerWidth/ hauteur;

                    // +10 et - 5 valeurs pour ??viter les bords blancs
                    if( ratio_fenetre >= ratio_img ){
                        image.width = window.innerWidth + 10;
                        image.height = height * (window.innerWidth + 10)/width;
                        image.x = -5;
                        image.y = hauteur/2 - image.height/2;
                    }else {
                        image.height = hauteur;
                        image.width = (width * hauteur/height) + 10;
                        image.x = (window.innerWidth/2 - image.width/2) - 5;
                    }
                };


                //displacement 2
                displacementSprite2=PIXI.Sprite.fromImage(directory_uri+"/img/gradient_large.png");
                displacementSprite2.texture.baseTexture.wrapMode=PIXI.WRAP_MODES.REPEAT;
                displacementFilter2 = new PIXI.filters.DisplacementFilter(displacementSprite2);


                displacementFilter2.scale.x = 0; //150

                displacementSprite2.scale.x=0.8;


                stage.addChild(displacementSprite2);
                stage.addChild(image);
                stage.filters=[displacementFilter2];

                loader.load((loader, resources) => {
                    bloque_action = false;
                    if( !document.querySelector('.all_works').classList.contains('actif') ){ pixi_single(); }

                    random = [];
                    document.querySelectorAll('.random').forEach(x=> random.push(x));
                    random.sort(function(){ return 0.5-Math.random(); });
                    TweenMax.staggerFromTo(random, 1,{x:'-24px'}, {x: '0px', opacity: 1, ease: Power2.easeOut}, 0.1);
                    TweenMax.to('#cover', 1, {opacity: 1, delay:0.4, ease: Power2.easeOut});

                    vitesse = 4;

                    document.getElementById('progress').style.display = "none";

                    echelle_scale = (document.getElementById('les_imgs').clientHeight + (0.28 * window.innerHeight) ) / document.getElementById('les_imgs').clientHeight;
                    echelle_scale = parseFloat( Math.round( echelle_scale * 100) / 100).toFixed(2);

                });

            }
            // TweenMax.to('body', 1, {opacity:1, onComplete:function(){
            //     scroll.init();
            //     scroll.resize();
            // }});
            //if($('event')[0]){}
            //console.log('animations');

        },
        // animations de sortie sorties
        loadPage = function(href) {

            document.getElementById('progress').style.display = "block";

            if(le_scroll !== null){ le_scroll.off(onscroll); }

            var xhr = new XMLHttpRequest(),
                method = "GET",
                url = href;

            xhr.open(method, url, true);
            xhr.onreadystatechange = function () {
                if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    ajaxLoad(xhr.responseText);
                }
            };
            xhr.send();

            //TweenMax.to('body', 3, {opacity:0, onComplete:function(){
            //sortie_ok = true;
            //}});

            if( document.querySelector('.all_works').classList.contains('actif') ){

                cancelAnimationFrame(raf_pixi_menu);
                TweenMax.to('#le_menu, #pixi_menu', 0.4, {opacity:0, ease: Power2.easeInOut, onComplete:function(){
                        stage_menu.removeChildren();
                        sortie_ok = true;
                        TweenMax.set('#main', {clearProps:"backgroundColor"});
                    }});

            }else if( document.querySelector('body').classList.contains('home') ){

                //vitesse = 4;
                listenCursor = false;
                bloque_action = true;

                //stage.removeChild(displacementSprite);
                //stage.addChild(displacementSprite2);

                random = [];
                document.querySelectorAll('.random').forEach(x=> random.push(x));
                random.sort(function(){ return 0.5-Math.random(); });
                TweenMax.staggerTo(random, 0.4, {x: '24px', opacity: 0, ease: Power2.easeIn}, 0.1);

                // TweenMax.to(attributs2, 0.9, {
                //     intensite: 150,
                //     x: 10,
                //     ease: Power2.easeIn,
                //     onUpdate: function () {
                //         displacementFilter2.scale.x = attributs2.intensite;
                //         vitesse = attributs2.x;
                //     },
                //     onComplete: function() {

                //     }
                // });

                TweenMax.to('#main', 1, { opacity:0, delay:0.4, ease: Power2.easeInOut, onComplete:function(){ sortie_ok = true; }});

                hovers = document.querySelectorAll('.change_projet');
                hovers.forEach(function (hover) {
                    hover.removeEventListener('mouseenter', onHover);
                    hover.removeEventListener('mouseleave', offHover);
                });

            }else if( document.querySelector('body').classList.contains('single') ){

                document.getElementById('to_next_proj').removeEventListener('mouseover', onHoverNext);
                document.getElementById('to_next_proj').removeEventListener('mouseout', offHoverNext);

                if(lien_bas){
                    var diff;

                    if(le_scroll !== null){
                        diff = document.getElementById('main').clientHeight - (le_scroll.vars.current + window.innerHeight);
                        TweenMax.to('#main', 1.2, {y: - (diff + window.innerHeight), ease: Power2.easeInOut});
                        TweenMax.to('#next_proj > div', 1.2, {y: diff + window.innerHeight - (document.getElementById('demi_haut').clientHeight/2), ease: Power2.easeInOut, onComplete:function(){
                                TweenMax.to('#next_proj > div', 0.4, {opacity:0, ease: Power2.easeInOut, onComplete:function(){
                                        //TweenMax.set('#main', {clearProps: "y"});
                                        sortie_ok = true;
                                    }});
                            }});
                    }else{
                        diff = document.getElementById('main').clientHeight - (window.pageYOffset + window.innerHeight);
                        TweenMax.to('#next_proj, .inner_img', 1.2, {y: - (diff + window.innerHeight), ease: Power2.easeInOut});
                        TweenMax.to('#next_proj > div', 1.2, {y: diff + window.innerHeight - (document.getElementById('demi_haut').clientHeight/2), ease: Power2.easeInOut, onComplete:function(){
                                TweenMax.to('#next_proj > div', 0.4, {opacity:0, ease: Power2.easeInOut, onComplete:function(){
                                        //TweenMax.set('#main', {clearProps: "y"});
                                        sortie_ok = true;
                                        window.scrollTo(0, 0);
                                    }});
                            }});
                    }

                }else{
                    TweenMax.to('#main', 0.4, {opacity:0, ease: Power2.easeInOut, onComplete:function(){
                            sortie_ok = true;
                        }});
                }
                //sortie_ok = true;

            }else if( document.querySelector('body').classList.contains('page-template-about') ) {

                // document.querySelector('.intro2').classList.remove('ouvert');
                // document.querySelector('.intro').classList.remove('ouvert');
                // setTimeout(function(){
                //     document.querySelector('.intro2').classList.add('ouvert');
                // document.querySelector('.intro').classList.add('ouvert');
                // }, 400);
                TweenMax.to('#main', 0.4, {opacity:0, clearProps:"backgroundColor", ease:Power2.easeInOut, onComplete:function(){
                        sortie_ok = true;
                    }});

            }else{
                sortie_ok = true;
            }


        },
        // mise ?? jour des donn??es de la page
        updatePage = function(html) {

            var parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            var liste_class = doc.querySelectorAll('body')[0].getAttribute('class');

            // maj titre de la page
            document.title = doc.querySelector('title').innerHTML;

            // maj class du body
            //document.querySelectorAll('body')[0].setAttribute('class', doc.querySelectorAll('body')[0].getAttribute('class'));
            var res = liste_class.replace("is-loading", "");
            document.querySelectorAll('body')[0].setAttribute('class', res);

            if(!isMobile()){
                document.querySelectorAll('body')[0].classList.add('desktop');
            }else{
                document.querySelectorAll('body')[0].classList.add('mobile');
            }

            // maj contenu #main
            document.getElementById('main').innerHTML = doc.getElementById('main').innerHTML;

            // on lance la nouvelle page
            init();
        };


    function le_raf_chargement() {

        raf_chargement = requestAnimationFrame(le_raf_chargement);
        if(sortie_ok === true && ajax_ok === true){

            //
            cancelAnimationFrame(raf_pixi_home);
            cancelAnimationFrame(raf_pixi_single);

            if( document.querySelector('body').classList.contains('single') || document.querySelector('body').classList.contains('home') ){
                stage.destroy();
                renderer.destroy();
            }

            updatePage(contenu_nouvelle_page);
            cancelAnimationFrame(raf_chargement);


        }
    }

    // gestion bouton prev/next navigateur
    window.onpopstate = function(e) {
        if(e.state !== null) {
            loadPage(location.href);
            le_raf_chargement();

            //le_scroll.off(onscroll);
        }
    };



    //------------------------------//
    // APPELS AU PREMIER CHARGEMENT //
    //------------------------------//
    history.pushState({}, '', location);
    // le_raf();
    init();
    if(!isMobile()){
        document.querySelectorAll('body')[0].classList.add('desktop');
    }else{
        document.querySelectorAll('body')[0].classList.add('mobile');
        document.getElementById('about').style.top = window.innerHeight/2 + 'px';
        document.getElementById('contact').style.top = window.innerHeight/2 + 'px';
    }




    // d??claration pixi menu
    renderer_menu = PIXI.autoDetectRenderer(
        0.24 * window.innerWidth, window.innerHeight - 0.074 * window.innerWidth, {transparent:!0}
    );
    document.getElementById('pixi_menu').appendChild(renderer_menu.view);

    stage_menu = new PIXI.Container();

    document.querySelectorAll('#le_menu li a').forEach(setDimensions_menu);

    //displacement 2
    displacementSprite3=PIXI.Sprite.fromImage(directory_uri+"/img/gradient_large.png");
    displacementSprite3.texture.baseTexture.wrapMode=PIXI.WRAP_MODES.REPEAT;
    displacementFilter3 = new PIXI.filters.DisplacementFilter(displacementSprite3);


    stage_menu.filters=[displacementFilter3];

    //settings displacement2
    //intensit??
    displacementFilter3.scale.x = 0;
    displacementFilter3.scale.y = 0;
    //echelle x/y
    displacementSprite3.scale.x=0.4;


}); // end doc ready vanilla

























// autres fonctions
function next_slide(){

    vitesse = 4;
    transition_commune();
    update_titre('next');

    window["image"+current_slide].alpha = 0;
    stage.addChild(window["image"+current_slide]);

    //image1.alpha = 1;
    var tl = new TimelineMax();
    tl.to(attributs2, 0.9, {
        intensite: 150,
        x: 20,
        //largeur: 0.8,
        ease: Power2.easeIn,
        onUpdate: function () {
            displacementFilter2.scale.x = attributs2.intensite;
            vitesse = attributs2.x;
            //displacementSprite2.scale.x = attributs2.largeur;
        },
        onComplete:function() {
            tl.reverse();
            setTimeout(function(){
                if(!isMobile()){
                    stage.removeChild(displacementSprite2);
                    stage.addChild(displacementSprite);
                }
                listenCursor = true;

                if(current_slide === 0){
                    stage.removeChild(window["image"+(total_slide-1)]);
                }else{
                    stage.removeChild(window["image"+(current_slide-1)]);
                }

                if(current_slide < (total_slide-1)){
                    current_slide++;
                }else{
                    current_slide = 0;
                }

                displacementSprite.x = currentMousePos.x;
                bloque_action = false;
            }, 800);
        }
    });

    TweenMax.to(attributs3, 0.6, {
        opacite: 1,
        delay:0.6,
        ease: Linear.easeNone,
        onUpdate: function () {
            window["image"+current_slide].alpha = attributs3.opacite;
        }
    });
}

function prev_slide(){
    vitesse = -4;
    transition_commune();
    update_titre('prev');

    if(current_slide === 0){
        window["image"+(total_slide-2)].alpha = 0;
        stage.addChild(window["image"+(total_slide-2)]);
    }else if(current_slide === 1){
        window["image"+(total_slide-1)].alpha = 0;
        stage.addChild(window["image"+(total_slide-1)]);
    }else{
        window["image"+(current_slide-2)].alpha = 0;
        stage.addChild(window["image"+(current_slide-2)]);
    }

    //image1.alpha = 1;
    var tl = new TimelineMax();

    //attributs2.anchor = 0;

    tl.to(attributs2, 0.9, {
        intensite: 150,
        x: -20,
        //largeur: 0.8,
        //anchor: 1,
        ease: Power2.easeIn,
        onUpdate: function () {
            displacementFilter2.scale.x = attributs2.intensite;
            vitesse = attributs2.x;
            //displacementSprite2.scale.x = attributs2.largeur;
            //displacementSprite2.anchor.x = attributs2.anchor;
        },
        onComplete:function() {
            tl.reverse();

            // attributs2.intensite = 150;
            // attributs2.x = -20;
            // tl.to(attributs2, 0.9, {
            //     intensite: 0,
            //     x: 0,
            //     ease: Power1.easeOut,
            //     onUpdate: function () {
            //         console.log(attributs2.largeur);
            //         displacementFilter2.scale.x = attributs2.intensite;
            //         vitesse = attributs2.x;
            //     }
            // });

            setTimeout(function(){

                if(!isMobile()){
                    stage.removeChild(displacementSprite2);
                    stage.addChild(displacementSprite);
                }
                listenCursor = true;


                if(current_slide === 0){
                    stage.removeChild(window["image"+(total_slide-1)]);
                }else{
                    stage.removeChild(window["image"+(current_slide-1)]);
                }

                if(current_slide > 0){
                    current_slide--;
                }else{
                    current_slide = total_slide-1;
                }

                displacementSprite.x = currentMousePos.x;
                bloque_action = false;
            }, 800);
        }
    });

    TweenMax.to(attributs3, 0.6, {
        opacite: 1,
        delay:0.6,
        ease: Linear.easeNone,
        onUpdate: function () {
            if(current_slide === 0){
                window["image"+(total_slide-2)].alpha = attributs3.opacite;
            }else if(current_slide === 1){
                window["image"+(total_slide-1)].alpha = attributs3.opacite;
            }else{
                window["image"+(current_slide-2)].alpha = attributs3.opacite;
            }
        }
    });
}



function transition_commune(){
    listenCursor = false;
    bloque_action = true;

    stage.removeChild(displacementSprite);
    stage.addChild(displacementSprite2);

    attributs.intensite = displacementFilter.scale.x;
    TweenMax.to(attributs, 0.3, {
        intensite: 0,
        ease: Power2.easeOut,
        onUpdate: function () {
            displacementFilter.scale.x = attributs.intensite;
        }
    });

    displacementSprite2.x = 0;
    attributs2.intensite = displacementFilter2.scale.x;
    attributs2.x = vitesse;
    attributs2.largeur = displacementSprite2.scale.x;

    attributs3.opacite = 0;

}


function setDimensions(item, index) {
    total_slide++;

    window["image"+index] = new PIXI.Sprite(
        PIXI.Texture.fromImage(item.getAttribute('data-url'))
    );

    window["image"+index].alpha = 0;

    loader.add("image" + index, item.getAttribute('data-url'));

    var img = new Image();
    img.src = item.getAttribute('data-url');
    img.onload = function() {
        var width = this.width;
        var height = this.height;

        var ratio_img = width/height;
        var ratio_fenetre = window.innerWidth/window.innerHeight;

        // +10 et - 5 valeurs pour ??viter les bords blancs
        if( ratio_fenetre >= ratio_img ){
            window["image"+index].width = window.innerWidth + 10;
            window["image"+index].height = height * (window.innerWidth + 10)/width;
            window["image"+index].x = -5;
            window["image"+index].y = window.innerHeight/2 - window["image"+index].height/2;
        }else {
            window["image"+index].height = window.innerHeight;
            window["image"+index].width = (width * window.innerHeight/height) + 10;
            window["image"+index].x = (window.innerWidth/2 - window["image"+index].width/2) - 5;
        }
    };
}

function setDimensions_menu(item, index) {
    //total_slide++;
    var cadre_width = 0.24 * window.innerWidth;
    var cadre_height = window.innerHeight - 0.074 * window.innerWidth;

    window["image_menu"+index] = new PIXI.Sprite(
        PIXI.Texture.fromImage(item.getAttribute('data-img'))
    );

    window["image_menu"+index].alpha = 0;

    var img = new Image();
    img.src = item.getAttribute('data-img');
    img.onload = function() {
        var width = this.width;
        var height = this.height;

        var ratio_img = width/height;
        var ratio_fenetre = cadre_width/cadre_height;

        // +10 et - 5 valeurs pour ??viter les bords blancs
        if( ratio_fenetre >= ratio_img ){
            window["image_menu"+index].width = cadre_width + 10;
            window["image_menu"+index].height = height * (cadre_width + 10)/width;
            window["image_menu"+index].x = -5;
            window["image_menu"+index].y = cadre_height/2 - window["image_menu"+index].height/2;
        }else {
            window["image_menu"+index].height = cadre_height;
            window["image_menu"+index].width = (width * cadre_height/height) + 10;
            window["image_menu"+index].x = (cadre_width/2 - window["image_menu"+index].width/2) - 5;
        }
    };
}

var random, multiplieur;
function update_titre(sens) {

    if(sens === 'next'){
        multiplieur = 1;
        TweenMax.to('#cercle_blanc', 0.9, {'stroke-dashoffset' : 190 * (1 - 1/total_slide - (current_slide * 1/total_slide)), ease: Power4.easeInOut});
    }else{
        multiplieur = -1;

        if(current_slide === 1){
            TweenMax.to('#cercle_blanc', 0.9, {'stroke-dashoffset' : 0, ease: Power4.easeInOut});
        }else if(current_slide === 0){
            TweenMax.to('#cercle_blanc', 0.9, {'stroke-dashoffset' : 190/total_slide, ease: Power4.easeInOut});
        }else{
            TweenMax.to('#cercle_blanc', 0.9, {'stroke-dashoffset' : 190 - (current_slide-1)* 190/total_slide, ease: Power4.easeInOut});
        }
    }

    random = [];
    document.querySelectorAll('.random').forEach(x=> random.push(x));

    random.sort(function(){ return 0.5-Math.random(); });

    TweenMax.staggerTo(random, 0.4, {x: multiplieur * 24 + 'px', opacity:0, ease:Power2.easeIn}, 0.1, allDone);
}
function allDone(){

    document.querySelectorAll('.random.first').forEach(x=> x.classList.remove('first'));

    document.querySelector('#num_lettre .current').classList.add('after');

    if(multiplieur === 1){
        if(document.querySelector('#num_lettre .current').nextElementSibling !== null){
            document.querySelector('#num_lettre .current').nextElementSibling.classList.add('before');
            var next = document.querySelector('#num_lettre .current').nextElementSibling;
            TweenMax.to('.current .lettre', 0.4, {x:'100%', clearProps:"x", ease:Power4.easeInOut});
            TweenMax.to(document.querySelector('#num_lettre .current').nextElementSibling.querySelector('div'), 0.4, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){
                    document.querySelector('#num_lettre .current').classList.remove('current','after');
                    next.classList.add('current');
                    next.classList.remove('before');
                }});
        }else{
            var first = document.querySelector('#num_lettre div');
            first.classList.add('before');
            TweenMax.to('.current .lettre', 0.4, {x:'100%', clearProps:"x", ease:Power4.easeInOut});
            TweenMax.to(first.querySelector('div'), 0.4, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){

                    if(document.querySelectorAll('.change_projet')[total_slide-1].classList.contains('first')){
                        document.querySelectorAll('.change_projet')[total_slide-1].classList.remove('first');
                    }

                    document.querySelector('#num_lettre .current').classList.remove('current','after');
                    first.classList.add('current');
                    first.classList.remove('before');
                }});
        }

        document.getElementById('num_projet').innerHTML = current_slide+1;
        document.getElementById('titre_h2').innerHTML = document.querySelectorAll('#images div')[current_slide].getAttribute('data-titre');
        document.getElementById('type').innerHTML = document.querySelectorAll('#images div')[current_slide].getAttribute('data-cat');
        document.getElementById('year').innerHTML = document.querySelectorAll('#images div')[current_slide].getAttribute('data-year');

        document.querySelectorAll('.update_link').forEach( x=> x.setAttribute('href',document.querySelectorAll('#images div')[current_slide].getAttribute('data-perma')));

    }else{
        if(document.querySelector('#num_lettre .current').previousElementSibling !== null){
            document.querySelector('#num_lettre .current').previousElementSibling.classList.add('before');
            var prev = document.querySelector('#num_lettre .current').previousElementSibling;
            TweenMax.to('.current .lettre', 0.4, {x:'-100%', clearProps:"x", ease:Power4.easeInOut});
            TweenMax.fromTo(document.querySelector('#num_lettre .current').previousElementSibling.querySelector('div'), 0.4, {x:'100%'}, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){
                    document.querySelector('#num_lettre .current').classList.remove('current','after');
                    prev.classList.add('current');
                    prev.classList.remove('before');

                }});
        }else{
            var last = document.querySelectorAll('#num_lettre > div')[total_slide-1];
            last.classList.add('before');
            TweenMax.to('.current .lettre', 0.4, {x:'-100%', clearProps:"x", ease:Power4.easeInOut});
            TweenMax.fromTo(last.querySelector('div'), 0.4, {x:'100%'}, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){
                    document.querySelector('#num_lettre .current').classList.remove('current','after');
                    last.classList.add('current');
                    last.classList.remove('before');
                }});
        }

        if(current_slide === 1){
            document.getElementById('num_projet').innerHTML = total_slide;
            document.getElementById('titre_h2').innerHTML = document.querySelectorAll('#images div')[total_slide-1].getAttribute('data-titre');
            document.getElementById('type').innerHTML = document.querySelectorAll('#images div')[total_slide-1].getAttribute('data-cat');
            document.getElementById('year').innerHTML = document.querySelectorAll('#images div')[total_slide-1].getAttribute('data-year');

            document.querySelectorAll('.update_link').forEach( x=> x.setAttribute('href',document.querySelectorAll('#images div')[total_slide-1].getAttribute('data-perma')));

        }else if(current_slide === 0){
            document.getElementById('num_projet').innerHTML = total_slide-1;
            document.getElementById('titre_h2').innerHTML = document.querySelectorAll('#images div')[total_slide-2].getAttribute('data-titre');
            document.getElementById('type').innerHTML = document.querySelectorAll('#images div')[total_slide-2].getAttribute('data-cat');
            document.getElementById('year').innerHTML = document.querySelectorAll('#images div')[total_slide-2].getAttribute('data-year');

            document.querySelectorAll('.update_link').forEach( x=> x.setAttribute('href',document.querySelectorAll('#images div')[total_slide-2].getAttribute('data-perma')));

        }else{
            document.getElementById('num_projet').innerHTML = current_slide-1;
            document.getElementById('titre_h2').innerHTML = document.querySelectorAll('#images div')[current_slide-2].getAttribute('data-titre');
            document.getElementById('type').innerHTML = document.querySelectorAll('#images div')[current_slide-2].getAttribute('data-cat');
            document.getElementById('year').innerHTML = document.querySelectorAll('#images div')[current_slide-2].getAttribute('data-year');

            document.querySelectorAll('.update_link').forEach( x=> x.setAttribute('href',document.querySelectorAll('#images div')[current_slide-2].getAttribute('data-perma')));

        }
    }

    document.querySelectorAll('#titre_h2 span').forEach(addRandom);

    random = [];
    document.querySelectorAll('.random').forEach(x=> random.push(x));

    random.sort(function(){ return 0.5-Math.random(); });

    TweenMax.staggerFromTo(random, 1, {x: -multiplieur * 24 + 'px', opacity:0}, {x: '0px', opacity:1, ease:Power2.easeOut}, 0.1);
}

function addRandom(item, index){
    item.classList.add('random');
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // return true;
}


















//------------------//
// RAFS             //
//------------------//
//cancelAnimationFrame(raf_pixi);
var num_image;
var num_image_temp = -1;
var delayx;
function pixi_home() {

    raf_pixi_home = requestAnimationFrame(pixi_home);
    //console.log('pixi home tourne');

    renderer.render(stage);


    if(listenCursor){
        //window["image" + (current_slide - 1)].x = 100

        mousePos.x = displacementSprite.x;
        //mousePos.y = displacementSprite.y;
        mousePos.intensite = displacementFilter.scale.x;
        mousePos.largeur = displacementSprite.scale.x;

        if(current_slide !== num_image_temp){

            num_image_temp = current_slide;

            if(current_slide === 0){
                num_image = total_slide-1;
            }else{
                num_image = current_slide-1;
            }

            //currentMousePos.x = 0;
            delayx = window["image" + num_image].x;

        }

        mousePos.correction = 0;

        TweenMax.to(mousePos, 0.3, {
            x: currentMousePos.x,
            //y: currentMousePos.y,
            intensite: (currentMousePos.x - ancien_delta) * 10,
            largeur: Math.abs(((currentMousePos.x - ancien_delta) / 80) - 0.2),
            correction: (currentMousePos.x - ancien_delta) / 40,
            onUpdate: function () {
                displacementSprite.x = mousePos.x;
                //displacementSprite.y = mousePos.y;
                displacementFilter.scale.x = mousePos.intensite;
                displacementSprite.scale.x = mousePos.largeur;
                window["image" + num_image].x = delayx + mousePos.correction;
            },
            ease: Linear.easeNone
        });

        //console.log((currentMousePos.x - ancien_delta) / 100);

        if(isMobile()){
            mousePos.penche = displacementFilter2.scale.x;

            TweenMax.to(mousePos, 0.3, {
                penche: (gamma * 20 - delta_gamma),
                onUpdate: function () {
                    displacementFilter2.scale.x = mousePos.penche;
                },
                ease: Linear.easeNone
            });

            //document.getElementById('titre_h2').innerHTML = gamma;

            displacementSprite2.x += 10;
        }

    }else{
        displacementSprite2.x += vitesse;

    }

    ancien_delta = currentMousePos.x;
    delta_gamma = gamma * 20;

}

function pixi_menu(){

    raf_pixi_menu = requestAnimationFrame(pixi_menu);
    //console.log('pixi menu tourne');

    renderer_menu.render(stage_menu);
    displacementSprite3.x += 4;


    if(!isMobile()){
        percent_cursor = Math.round(currentMousePos.y * 100 / window.innerHeight * 100)/100;
        le_delta_menu = currentMousePos.y;
    }else{
        percent_cursor = window.pageYOffset * 100 / (hauteur_menu - window.innerHeight);
        le_delta_menu = window.pageYOffset;
    }

    if(Math.abs((le_delta_menu - delta_menu)/ 200 + 1) < 1.8){
        intensite = Math.abs((le_delta_menu - delta_menu)/ 200 + 1);
    }else{ intensite = 1.8; }

    // d??placement menu
    if(!isMobile()){

        expression = -1 * (hauteur_menu - window.innerHeight)/ window.innerHeight * currentMousePos.y;
        TweenMax.to('#le_menu', 1.4, {
            y: expression + 'px',
            scaleY: intensite,
            ease:Power2.easeOut
        });

    }else{

        TweenMax.to('#le_menu', 1.4, {
            scaleY: intensite,
            ease:Power2.easeOut
        });

    }

    if(window.innerWidth > 767){

        if(percent_cursor > hauteur_marge && percent_cursor < (100 - hauteur_marge) ){
            document.querySelectorAll('#le_menu li').forEach(checkerMenu);
        }

        displace.intensite = displacementFilter3.scale.x;
        TweenMax.to(displace, 0.3, {
            intensite: (le_delta_menu - delta_menu) * 4,
            onUpdate: function () {
                displacementFilter3.scale.x = displace.intensite;
            },
            ease: Linear.easeNone
        });
    }

    delta_menu = le_delta_menu;
}

var passe_une_fois = false, ancien_height = 0;
function pixi_single(){

    if(document.querySelector('.vs-section').clientHeight != ancien_height && !isMobile()){
        le_scroll.resize();
        ancien_height = document.querySelector('.vs-section').clientHeight;
    }

    raf_pixi_single = requestAnimationFrame(pixi_single);

    //echelle_scale = parseFloat(Math.round( (document.getElementById('les_imgs').clientHeight + (0.56 * window.innerHeight) ) / document.getElementById('les_imgs').clientHeight * 100) / 100).toFixed(2);
    //echelle_scale = (document.getElementById('les_imgs').clientHeight + (0.56 * window.innerHeight) ) / document.getElementById('les_imgs').clientHeight;
    //echelle_scale = parseFloat( Math.round( echelle_scale * 100) / 100).toFixed(2);
    //console.log(echelle_scale);
    //console.log('pixi single tourne');

    renderer.render(stage);

    displacementSprite2.x += vitesse;

    if(le_scroll !== null){
        if(le_scroll.vars.target !== 0 && passe_une_fois === false){
            passe_une_fois = true;
            animSingle();
        }else if(le_scroll.vars.target === 0 && passe_une_fois === true){
            passe_une_fois = false;
            animSingle2();
        }
    }else{
        if(window.pageYOffset !== 0 && passe_une_fois === false){
            passe_une_fois = true;
            animSingle();
        }else if(window.pageYOffset === 0 && passe_une_fois === true){
            passe_une_fois = false;
            animSingle2();
        }
    }

    // TweenMax.to('#les_imgs', 1.4, {
    //     scaleY: intensite,
    //     ease:Power2.easeOut
    // });

    // if(le_scroll !== null){
    //     delta_scroll = le_scroll.vars.current;
    // }else{
    //     //
    // }
}

function raf_about() {
    le_raf_about = requestAnimationFrame(raf_about);

    if(le_scroll !== null){
        TweenMax.to('#inner_svg', 1, {rotation: -le_scroll.vars.current/4, ease: Linear.easeNone});
        TweenMax.to('#inner_svg img', 1, {rotation: le_scroll.vars.current/4, ease: Linear.easeNone});

        if(Math.abs((le_scroll.vars.current - delta_scroll)/ 200 + 1) < 2.2){
            intensite = Math.abs((le_scroll.vars.current - delta_scroll)/ 200 + 1);
        }else{ intensite = 2.2; }

    }else{
        TweenMax.to('#inner_svg', 1, {rotation: -window.pageYOffset/4, ease: Linear.easeNone});
        TweenMax.to('#inner_svg img', 1, {rotation: window.pageYOffset/4, ease: Linear.easeNone});

        if(Math.abs((window.pageYOffset - delta_scroll)/ 200 + 1) < 2.2){
            intensite = Math.abs((window.pageYOffset - delta_scroll)/ 200 + 1);
        }else{ intensite = 2.2; }

    }


    // if(le_scroll !== null){

    // }else{

    // }

    TweenMax.to('#scaleA', 1.4, {
        scaleX: intensite,
        ease:Power2.easeOut
    });

    if(le_scroll !== null){
        delta_scroll = le_scroll.vars.current;
    }else{
        delta_scroll = window.pageYOffset;
    }

}

// function le_raf() {
//     raf = requestAnimationFrame(le_raf);
// }

var dernier_ajoute = 0, displace = {}, displace2 = {};
function checkerMenu(item, index) {
    if(
        percent_cursor > (hauteur_marge + (index * hauteur_entree)) &&
        percent_cursor < (hauteur_marge + ((index + 1) * hauteur_entree)) &&
        !item.classList.contains('actif')
    ){
        document.querySelector('#le_menu .actif').classList.remove('actif');
        item.classList.add('actif');

        document.getElementById('pixi_menu').setAttribute('href',item.querySelector('a').getAttribute('href'));

        // ajouter la nouvelle image
        stage_menu.addChild(window['image_menu' + index]);

        displace2.alpha = 0;
        //stage_menu.removeChild(displacementSprite3);

        TweenMax.to(displace2, 0.2, {
            alpha: 1,
            onUpdate: function () {
                window['image_menu' + index].alpha = displace2.alpha;
            },
            onComplete: function()??{

                // to do : gestion suppression ancien child

                //stage_menu.removeChildren(2);
                //dernier_ajoute = index;

            },
            ease: Linear.easeNone
        });

    }
}

var lindex;
function change_projet(element){
    if(element.classList.contains('current')){ return; }
    else{

        lindex = Array.from(document.getElementById('num_lettre').children).indexOf(element);
        const index_courant = Array.from(document.getElementById('num_lettre').children).indexOf(document.querySelector('#num_lettre .current'));

        vitesse = 4;
        transition_commune();

        window["image"+lindex].alpha = 0;
        stage.addChild(window["image"+lindex]);

        var tl = new TimelineMax();
        tl.to(attributs2, 0.9, {
            intensite: 150,
            x: 20,
            ease: Power2.easeIn,
            onUpdate: function () {
                displacementFilter2.scale.x = attributs2.intensite;
                vitesse = attributs2.x;
            },
            onComplete:function() {
                tl.reverse();
                setTimeout(function(){
                    stage.removeChild(displacementSprite2);
                    stage.addChild(displacementSprite);
                    listenCursor = true;

                    stage.removeChild(window["image"+(index_courant)]);

                    if(lindex >= total_slide-1){
                        current_slide = 0;
                    }else{
                        current_slide = lindex + 1;
                    }


                    displacementSprite.x = currentMousePos.x;
                    bloque_action = false;
                }, 800);
            }
        });

        TweenMax.to(attributs3, 0.6, {
            opacite: 1,
            delay:0.6,
            ease: Linear.easeNone,
            onUpdate: function () {
                window["image"+lindex].alpha = attributs3.opacite;
            }
        });

        TweenMax.to('#cercle_blanc', 0.9, {'stroke-dashoffset' : 190 * (1 - 1/total_slide - (lindex * 1/total_slide)), ease: Power4.easeInOut});

        random = [];
        document.querySelectorAll('.random').forEach(x=> random.push(x));

        random.sort(function(){ return 0.5-Math.random(); });
        TweenMax.staggerTo(random, 0.4, {x: '24px', opacity:0, ease:Power2.easeIn}, 0.1, allDone2);


    }
}
function allDone2(){
    document.querySelector('#num_lettre .current').classList.add('after');
    TweenMax.to('.current .lettre', 0.4, {x:'100%', clearProps:"x", ease:Power4.easeInOut});
    document.querySelectorAll('#num_lettre > div')[lindex].classList.add('before');
    TweenMax.to(document.querySelectorAll('#num_lettre > div')[lindex].querySelector('div'), 0.4, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){
            document.querySelector('#num_lettre .current').classList.remove('current','after');
            document.querySelectorAll('#num_lettre > div')[lindex].classList.add('current');
            document.querySelectorAll('#num_lettre > div')[lindex].classList.remove('before');
        }});

    // if(document.querySelector('#num_lettre .current').nextElementSibling !== null){
    //     document.querySelector('#num_lettre .current').nextElementSibling.classList.add('before');
    //     var next = document.querySelector('#num_lettre .current').nextElementSibling;
    //     TweenMax.to('.current .lettre', 0.4, {x:'100%', clearProps:"x", ease:Power4.easeInOut});
    //     TweenMax.to(document.querySelector('#num_lettre .current').nextElementSibling.querySelector('div'), 0.4, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){
    //         document.querySelector('#num_lettre .current').classList.remove('current','after');
    //         next.classList.add('current');
    //         next.classList.remove('before');
    //     }});
    // }else{
    //     var first = document.querySelector('#num_lettre div');
    //     first.classList.add('before');

    //     TweenMax.to('.current .lettre', 0.4, {x:'100%', clearProps:"x", ease:Power4.easeInOut});
    //     TweenMax.to(first.querySelector('div'), 0.4, {x:'0%', clearProps:"x", ease:Power4.easeInOut, onComplete:function(){
    //         document.querySelector('#num_lettre .current').classList.remove('current','after');
    //         first.classList.add('current');
    //         first.classList.remove('before');
    //     }});
    // }

    document.getElementById('num_projet').innerHTML = lindex+1;
    document.getElementById('titre_h2').innerHTML = document.querySelectorAll('#images div')[lindex].getAttribute('data-titre');
    document.getElementById('type').innerHTML = document.querySelectorAll('#images div')[lindex].getAttribute('data-cat');
    document.getElementById('year').innerHTML = document.querySelectorAll('#images div')[lindex].getAttribute('data-year');

    document.querySelectorAll('.update_link').forEach( x=> x.setAttribute('href',document.querySelectorAll('#images div')[lindex].getAttribute('data-perma')));

    document.querySelectorAll('#titre_h2 span').forEach(addRandom);

    random = [];
    document.querySelectorAll('.random').forEach(x=> random.push(x));

    random.sort(function(){ return 0.5-Math.random(); });
    TweenMax.staggerFromTo(random, 1, {x: '-24px', opacity:0}, {x: '0px', opacity:1, ease:Power2.easeOut}, 0.1);

}


function animSingle(){
    vitesse = 4;
    var attributs2bis = { intensite : 0, x : 4};
    TweenMax.to(attributs2bis, 0.9, {
        intensite: 150,
        x: 6,
        ease: Power2.easeIn,
        onUpdate: function () {
            displacementFilter2.scale.x = attributs2bis.intensite;
            vitesse = attributs2bis.x;
        }
    });
}
function animSingle2(){
    vitesse = 6;
    var attributs2bis = { intensite : 150, x : 6};
    TweenMax.to(attributs2bis, 0.9, {
        intensite: 0,
        x: 4,
        ease: Power2.easeOut,
        onUpdate: function () {
            displacementFilter2.scale.x = attributs2bis.intensite;
            vitesse = attributs2bis.x;
        }
    });
}

function onHover (event) {
    event.target.classList.add('trait');
    document.querySelector('.change_projet.current').classList.add('temp');
}
function offHover (event) {
    event.target.classList.remove('trait');
    document.querySelector('.change_projet.current').classList.remove('temp');
}


var once_play = false;
function onHoverNext (event) {
    if(once_play === false){
        once_play = true;

        random = [];
        document.querySelectorAll('#to_next_proj span').forEach(x=> random.push(x));
        random.sort(function(){ return 0.5-Math.random(); });

        TweenMax.staggerTo(random, 0.4, {opacity: 0, ease: Power2.easeIn}, 0.05, allDoneNext);

        TweenMax.to('#inner_nom_projet', 0.4, {x: (document.getElementById('nom_projet').clientWidth + 10) / 2 + 'px', delay:0.4, ease:Power2.easeOut});
        TweenMax.staggerTo('.stag', 0.4, {opacity: 1, delay:0.4, ease: Power2.easeOut}, -0.02);
    }

}
function allDoneNext() {
    document.getElementById('to_next_proj').innerHTML = document.getElementById('to_next_proj').getAttribute('data-next');
    TweenMax.set('#to_next_proj span', {opacity:0});

    random = [];
    document.querySelectorAll('#to_next_proj span').forEach(x=> random.push(x));
    random.sort(function(){ return 0.5-Math.random(); });

    TweenMax.staggerTo(random, 0.4, {opacity: 1, ease: Power2.easeOut}, 0.05);
}


function offHoverNext (event) {

    if(once_play === true){
        once_play = false;

        random = [];
        document.querySelectorAll('#to_next_proj span').forEach(x=> random.push(x));
        random.sort(function(){ return 0.5-Math.random(); });

        TweenMax.staggerTo(random, 0.4, {opacity: 0, ease: Power2.easeIn}, 0.05, allDoneNext2);
    }
}
function allDoneNext2() {
    document.getElementById('to_next_proj').innerHTML = "<span>N</span><span>e</span><span>x</span><span>t</span>";
    TweenMax.set('#to_next_proj span', {opacity:0});

    random = [];
    document.querySelectorAll('#to_next_proj span').forEach(x=> random.push(x));
    random.sort(function(){ return 0.5-Math.random(); });

    TweenMax.staggerTo(random, 0.4, {opacity: 1, ease: Power2.easeOut}, 0.05);

    TweenMax.to('#inner_nom_projet', 0.4, {x: '0px', ease:Power2.easeOut});
    TweenMax.staggerTo('.stag', 0.4, {opacity: 0, ease: Power2.easeOut}, 0.02);
}




//swipe event
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if( document.querySelector('body').classList.contains('home') && bloque_action === false){
            if ( xDiff > 0 ) {
                next_slide();
            } else {
                prev_slide();
            }
        }
    } else {
        if( document.querySelector('body').classList.contains('home') && bloque_action === false){
            if ( yDiff > 0 ) {
                next_slide();
            } else {
                prev_slide();
            }
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
}



// giroscope event
var gamma, delta_gamma;
if(window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", process, false);
}
function process(event) {

    if(window.orientation === 0){
        gamma = event.gamma;
    }else if(window.orientation === 180){
        gamma = -event.gamma;
    }else if(window.orientation === -90){
        gamma = -event.beta;
    }else if(window.orientation === 90){
        gamma = event.beta;
    }

}


// const ticker = new PIXI.ticker.Ticker();
// ticker.stop();
// ticker.add((deltaTime) => {
//   // do something every frame
//   console.log('iii');
// });
// ticker.start();
