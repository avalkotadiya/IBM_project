/**
 * Frontend Toolkit JS
 *
 * @author Rascals Themes
 * @category JavaScripts
 * @package Angio Toolkit
 * @version 1.1.0
 */


var themeToolkit = (function($) {

    "use strict";

    // Variables
    const doc = document;
    let toolkitVars = {
		ajaxReload : false,
		isAjax: false,
	};

    /* Init
     -------------------------------- */

    if ( $( 'body' ).hasClass('AXloader') ) {
		toolkitVars.isAjax = true;
	}	

    /* Ajax: Enabled */
    doc.addEventListener('AXEnd', function(customEvent) {
    	if ( toolkitVars.ajaxReload ) {
    		themeToolkit.reload($);
    	}
    	toolkitVars.ajaxReload = true;
        
    });
    doc.addEventListener('AXStart', function(customEvent) {
    	if ( toolkitVars.ajaxReload ) {
    		themeToolkit.loadStart($);
    	}
        
    });

    doc.addEventListener("DOMContentLoaded", function() {
        themeToolkit.init($);
    });


    return {

        /* Init
         -------------------------------- */
        init : function(){
        	this.woo.cart.init();
        	this.woo.cart.addToCartButton();
        	this.woo.products.filters();
        	this.woo.quantity();
        	this.woo.tabs();
        	
            this.lightbox.init();
            this.events.list();
            this.player.init();
            this.disqus();
        },
        reload: function() {
        	this.woo.removeEvents();
        	this.woo.tabs();
        	this.woo.products.filters();

            this.lightbox.init();
            this.events.list();
            this.player.update();
            this.disqus();
        },

        loadStart: function() {
        	this.magicWave.kill();
        },
        

     	/* ==================================================
          WooCommerce
        ================================================== */
        woo: {

        	quantity : function() {

        		$('body').on( 'click', '.wc-quantity .plus, .wc-quantity .minus', function() {
  
	            // Get current quantity values
	            let 
	            	qtyWrap = $( this ).closest( '.wc-quantity' ),
	            	qty = qtyWrap.find( '.qty' ),
	           		val = parseFloat(qty.val()),
	           		max = parseFloat(qty.attr( 'max' )),
	           		min = parseFloat(qty.attr( 'min' )),
	           		minStep = 1,
	           		step = parseFloat(qty.attr( 'step' ));
	  			
	  			if ( qtyWrap.hasClass('is-cart-page') ) {
	  				minStep = 0;
	  				
	  			}
	            // Change the value if plus or minus
	            if ( $( this ).is( '.plus' ) ) {
					if ( max && ( max <= val ) ) {
						qty.val( max );
					} else {
						qty.val( val + step );
					}
	            } else {
					if ( min && ( min >= val ) ) {
						qty.val( min );
					} else if ( val > minStep ) {
						qty.val( val - step );
					}
	            }
	            // Trigger change event
            	qty.trigger( 'change' );
              
         });
        	},

        	products : {

        		filters : function() {

        			if ( ! $('.wc-filters').length ) {
        				return false;
        			}

        			//  Ajax
        			let isAjax = true;
        			
        			// Pretty permalinks
        			let prettyPermalinks = true;
        			if ( $('.wc-filters').data('data-permalinks-structure') === 'base' ) {
        				prettyPermalinks = false;
        			}	

        			// Categories

        			$( '.wc-filters' ).on( 'change', '.js-wc-filter select', function(event) {
        				let thisPermalink = $(this).parent().data('permalinks');
        				let val = $(this).val();
    					let thisUrl = '';
    					let goToUrl = ''; 
    					let shopUrl = $(this).find("option:first-child").val();

    					if ( ! prettyPermalinks ) {
    						thisUrl = window.location.hostname;
    						goToUrl = toolkitOptions.siteUrl + '/' + val + ''; 
    					} else {
    						thisUrl = window.location.hostname;
    						goToUrl = toolkitOptions.siteUrl + '/' + thisPermalink + '/'  + val; 
    					}

    					// Go to the shop page if is selected default value 
    					if ( val === shopUrl ) {
    						goToUrl = shopUrl;
    					}

    					if ( toolkitVars.isAjax ) {
    						AXloader.loadUrl( goToUrl );
    					} else {
    						window.location = goToUrl;
    					}

        			});
                   
        			// Only if Ajax is enabled
    				if ( toolkitVars.isAjax ) {

    					// Ordering
        				$( '.woocommerce-ordering' ).off( 'change', 'select.orderby' );
        				$( '.woocommerce-ordering' ).on( 'change', 'select.orderby', function() {

        					let val = $(this).val();
        					let thisUrl = ''
        					let goToUrl = ''; 

        					if ( ! prettyPermalinks ) {
        						thisUrl = window.location.href.split('?')[0];
        						goToUrl = thisUrl + '?orderby='+val+'&paged=1&post_type=product'; 
        					} else {
        						thisUrl = window.location.href.split('?')[0];
        						goToUrl = thisUrl + '?orderby=' + val; 
        					}
        					
        					AXloader.loadUrl( goToUrl )
						});
    				}


        		}
        	},

        	cart : {

        		init :  function() {
        			
        			// Events
        			$( 'body' ).on( 'updated_cart_totals', themeToolkit.woo.cart.update );
					$( 'body' ).on( 'removed_from_cart', e=>{
						if ( $( '.woocommerce-cart-form .qty' ).first() ) {
							$( '.woocommerce-cart-form .qty' ).first().trigger( 'change' );
						};
						$( "[name='update_cart']" ).trigger( "click" );
						themeToolkit.woo.cart.update(); 

					});
					$( 'body' ).on( 'wc_cart_emptied', e=>{
						if ( $('.js-cart-counter') ) {
                        	$('.js-cart-counter').text( '0' );
                        	$('.js-cart-counter').addClass('cart-updated').delay(1000).queue(function(){
							    $(this).removeClass('cart-updated').dequeue();
							});
                        }
					});

					$( 'body' ).on( 'added_to_cart', (event, fragments, cart_hash, $button)=>{
						themeToolkit.woo.cart.update(); 
					});

        			$( 'body' ).on('click', '.js-cart-button', function(e){
        				$( '.js-cart-widget' ).toggleClass('visible');
        				e.preventDefault;
        			});
        			$( 'body' ).on('click', '.js-cart-widget-close, .woocommerce-mini-cart__buttons a, .mini-cart-item-title a', function(e){
        				$( '.js-cart-widget' ).removeClass('visible');
        				e.preventDefault;
        			});
        		},

        		update : function() {
        			
    			 	$.ajax({
	                    url: ajax_action.ajaxurl,
	                    type: 'post',
	                    data: {
	                        action: 'angio_toolkit_update_cart',
	                        ajax_nonce: ajax_action.ajax_nonce,
	                    },
	                    success: function(result) {
	                        if (result === 'Busted!') {
	                            location.reload();
	                            return false;
	                        }

	                        if ( $('.js-cart-counter') ) {
	                        	$('.js-cart-counter').text( result );
	                        	$('.js-cart-counter').addClass('cart-updated').delay(1000).queue(function(){
								    $(this).removeClass('cart-updated').dequeue();
								});
	                        }
	                      
	                    },
	                    error: function(request, status, error) {
	                    	console.log(error);
	                    }
	                });

        		},

        		addToCartButton : function() {

        			// Overwrite default event
        			$( document ).on( 'click', '.single_add_to_cart_button:not(.product_type_variable)', function(e) {
						e.preventDefault();
				        let $thisbutton = $(this);
				        let $form = $thisbutton.closest('form.cart');
				        if ( $thisbutton.hasClass('loop_add_to_cart') ) {
				        	$form = $thisbutton.closest('.wcp-button');
				        }

				        let id = $thisbutton.val(),
			                product_qty = $form.find('input[name=quantity]').val() || 1,
			                product_id = $form.find('input[name=product_id]').val() || id,
			                variation_id = $form.find('input[name=variation_id]').val() || 0;

				        let data = {
				            action: 'angio_toolkit_add_to_cart_button',
				            product_id: product_id,
				            product_sku: '',
				            quantity: product_qty,
				            variation_id: variation_id,
				        };

				        $(document.body).trigger('adding_to_cart', [$thisbutton, data]);

				        $.ajax({
				            type: 'post',
				            url: ajax_action.ajaxurl,
				            data: data,
				            beforeSend: function (response) {
				                $thisbutton.removeClass('added').addClass('wc-loading');
				            },
				            complete: function (response) {
				                $thisbutton.addClass('added').removeClass('wc-loading');
				                $thisbutton.remove();
				            },
				            success: function (response) {

				                if (response.error && response.product_url) {
				                    window.location = response.product_url;
				                    return;
				                } else {
				                    $(document.body).trigger('added_to_cart', [response.fragments, response.cart_hash, $thisbutton]);
				                }
				            },
				        });

				        return false;
					});

        		}


        	},

        	
        	tabs : function() {
        		let tabs = document.querySelectorAll('.woocommerce-tabs li a');
        		for ( let t of tabs ) {
        			t.addEventListener('click', (e) => {
        				let li = t.parentNode;
        				let id = t.getAttribute('href');
        				let panel = document.querySelector(id);
        				let oldTab = document.querySelector('.woocommerce-tabs li.active');
        				let oldTabLink = oldTab.querySelector('a');
        				let oldId = oldTabLink.getAttribute('href');
        				let oldPanel = document.querySelector(oldId);
        				// Remove Old Tab
        				oldPanel.style.display = 'none';
        				oldTab.classList.remove('active');
        				// Active Current
        				li.classList.add('active');
        				panel.style.display = 'block';
        				e.stopImmediatePropagation();
        				e.preventDefault();
        			});
        		}

        	},
        	removeEvents : function() {
        		jQuery('body').off('init', '#rating');
    			jQuery( document ).off( 'wc_update_cart added_to_cart' );

        	}

        },

         /* ==================================================
          MagicWave 
        ================================================== */
        magicWave: {
        	_then : null, 
        	delta : null, 
        	fps : null, 
        	interval : null, 
        	isStop : null, 
        	segWidth : null,
        	autoPointInterval : null,
        	baseY : null,
        	ctx : null,
        	now : null,
        	ref : null, 
        	ref1 : null, 
        	ref2 : null, 
        	ref3 : null, 
        	ref4 : null, 
        	ref5 : null, 
        	ref6 : null, 
        	ref7 : null, 
        	ref8 : null,
    	 	canvasDom : null,
            amount : 14,
            spring : -4,
            damping : -0.1,
            randomAmount: 2,
            baseYvalue: 0.5,
            limit : 1.08,
            waveCount : 3,
            mass : 0.1,
            mouseMoveCount : 0,
          
            wavePointsSet : [[]],
            waveColors : ["#33f7dd", "#13776a", "#121212"],
            nimFrame : null,
            timeInterval : 0,

        	init : function() {
        		let that = themeToolkit.magicWave;

        		that.canvasDom = document.getElementById('magic-wave');
        		if ( ! that.canvasDom ) {
        			that.kill();
        			return;
        		}

        		if (that.animFrame != null) {
                    window.cancelAnimationFrame(that.animFrame)
                }
                that.timeInterval = 0;

                // Colors
                let col1 = that.canvasDom.getAttribute('data-col1');
                let col2 = that.canvasDom.getAttribute('data-col2');
                that.waveColors[0] = col1;
                that.waveColors[1] = col2;
                
                that.reSize();
               	that.multiPoints(that.timeInterval);
                that.doWaveLoop()
        		
        		// Set normal Values
        		
        		setTimeout( e=> {
        			that.multiPoints(150);
	                that.limit = 1.15;
	                that.damping = -0.1;
        		}, 1300 );
        		

                window.addEventListener("resize", that.reSize,false);

        	},

        	reSize : function() {

        		let that = themeToolkit.magicWave;
        		var _y;

                that.canvasDom.width = window.innerWidth;
                that.canvasDom.height = (window.innerHeight);
                that.ctx = that.canvasDom.getContext('2d');
                that.segWidth = window.innerWidth / that.amount;
                that.baseY = that.canvasDom.height * that.baseYvalue;
                that.ctx.canvas.width = window.innerWidth;
                _y = window.innerHeight / 2 - that.canvasDom.height / 2;
                that.setPoints()

        	},

        	setPoints : function() {

        		let that = themeToolkit.magicWave

                var i, j, ref, results1;
                results1 = [];
                for (i = j = 0,
                ref = that.waveCount; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
                    that.wavePointsSet[i] = [];
                    results1.push(that.initPoints(that.wavePointsSet[i]))
                }
                return results1
            },

            initPoints : function(wavePoints) {
            	let that = themeToolkit.magicWave;

                var i, j, point, ref, results1;
                results1 = [];
                for (i = j = 0,
                ref = that.amount; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
                    point = {
                        x: that.segWidth * i,
                        y: wavePoints[i] ? wavePoints[i].y : that.baseY,
                        vx: wavePoints[i] ? wavePoints[i].vx : 0,
                        vy: wavePoints[i] ? wavePoints[i].vy : 0
                    };
                    results1.push(wavePoints[i] = point)
                }
                return results1
            },
            updatePoints : function(wavePoints, spring, damping, time) {
            	let that = themeToolkit.magicWave;
                var dampingY, i, j, len, point, results1, springY;
                results1 = [];
                for (i = j = 0,
                len = wavePoints.length; j < len; i = ++j) {
                    point = wavePoints[i];
                    springY = spring * (point.y - this.baseY);
                    dampingY = damping * point.vy;
                    point.vy += (springY + dampingY) / this.mass * time;
                    results1.push(point.y += point.vy * time)
                }
                return results1
            },
            doWave : function(wavePoints, color) {
            	let that = themeToolkit.magicWave;
                var i, j, ref, xc, yc;
                that.ctx.beginPath();
                that.ctx.lineTo(0, 0);
                that.ctx.quadraticCurveTo(-100, that.baseY, -150, that.baseY);
                for (i = j = 0,
                ref = wavePoints.length - 1; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
                    xc = (wavePoints[i].x + wavePoints[i + 1].x) / 2;
                    yc = (wavePoints[i].y + wavePoints[i + 1].y) / 2;
                    that.ctx.quadraticCurveTo(wavePoints[i].x, wavePoints[i].y, xc, yc)
                }
                that.ctx.quadraticCurveTo(wavePoints[wavePoints.length - 2].x, wavePoints[wavePoints.length - 2].y, wavePoints[that.amount].x, wavePoints[that.amount].y);
                that.ctx.lineTo(window.innerWidth,0);
              
                that.ctx.closePath();
                that.ctx.fillStyle = color;
                that.ctx.globalCompositeOperation = 'source-over';
                that.ctx.fill()

            },

        	multiPoints : function(_timeInterval) {
        		let that = themeToolkit.magicWave;

        		if (that.autoPointInterval != null) {
                    clearInterval(that.autoPointInterval)
                }
                return that.autoPointInterval = setInterval((()=>{
                    var _randomPoint;
                    _randomPoint = {
                        x: that.randomInt(0, window.innerWidth),
                        y: that.randomInt(0, that.baseY)
                    };

                    that.setXnum(_randomPoint.x);
                    that.triggerPoint(_randomPoint)
                }
                ), _timeInterval)
        	},
        	randomInt: function(min, max) {
            	return Math.floor(Math.random() * (max - min)) + min
        	},
        	limitMaxMin: function(value, max, min) {
            	return Math.min(Math.max(parseInt(value), min), max)
       	 	},
        	setXnum : function(pointX) {
        		let that = themeToolkit.magicWave;
                return that.xNum = Math.round(pointX / window.innerWidth * that.amount)
            },


            triggerPoint : function(point) {
            	let that = themeToolkit.magicWave;
                var _limit, _velocity, i, j, len, points, ref, results1;
                _velocity = point.y;
                if (_velocity > 0) {
                    _velocity *= -1
                }
                _limit = window.innerHeight * that.limit / 100;
                _velocity = that.limitMaxMin(_velocity, _limit, -_limit);
                _velocity *= 10;
                ref = that.wavePointsSet;
                results1 = [];
                for (i = j = 0,
                len = ref.length; j < len; i = ++j) {
                    points = ref[i];
                    if (points[that.xNum].vy < 0) {
                        results1.push(points[that.xNum].vy += _velocity)
                    } else {
                        results1.push(points[that.xNum].vy -= _velocity)
                    }
                }
                return results1
            },
        	doWaveLoop : function() {
        		let that = themeToolkit.magicWave;
        		var i, j, ref;
                that.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                that.updatePoints(that.wavePointsSet[0], that.spring, that.damping, 0.0161);
                that.updatePoints(that.wavePointsSet[1], that.spring - 0.5, that.damping + 0.01, 0.0162);
                that.updatePoints(that.wavePointsSet[2], that.spring - 1, that.damping + 0.02, 0.0163);
                for (i = j = 0, ref = that.waveCount; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
                    that.doWave(that.wavePointsSet[i], that.waveColors[i])
                }
                 
               	that.moveThis();
                return that.animFrame = requestAnimationFrame(that.doWaveLoop.bind(that))

        	},

        	moveThis : function() {
        		let that = themeToolkit.magicWave;
        		var i, j, len, point, ref, results1;
                ref = that.wavePointsSet[0];
                results1 = [];
                for (i = j = 0,
                len = ref.length; j < len; i = ++j) {

                    point = ref[i];
                  
                    if (!point.ty) {
                        point.ty = 0
                    }
                    point.ty += point.vy * 0.018 / 2.3
                    
                    if (i === that.amount - 2) {
                        results1.push(gsap.to('.wave-move-this', 0, {
                            y: point.ty
                        }))
                    } else {
                        results1.push(void 0)
                    }
                }
                return results1

        	},

        	kill : function() {
        		let that = themeToolkit.magicWave;
        		if (that.animFrame !== null) {
                	window.cancelAnimationFrame(that.animFrame);
                	that.animFrame = null;
                	window.removeEventListener("resize", that.reSize,false);
            	}
                

        	}


        },


        /* ==================================================
          Parallax Slider 
        ================================================== */
        parallaxSlider: {

        	init : function() {

        		// Params
				let mainSliderSelector = '.px-slider',
				    interleaveOffset = 0.5;

				// Main Slider
				let mainSliderOptions = {
					loop: true,
					speed:900,
					grabCursor: true,
					watchSlidesProgress: true,
					mousewheel: true,
					allowTouchMove:true,
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev',
					},
					pagination: {
						el: '.px-slider-bullets',
						clickable: true,
						bulletActiveClass: 'active',
						renderBullet: function (index, className) {
							return '<div class="px-slider-bullet-wrap ' + className + '"><div class="magneto"> <a href="#" class="px-slider-bullet"><span class="px-slider-bullet__inner"><span class="px-slider-bullet__dot"></span></span></a></div></div>';
						},
					},
					on: {
				        init: function(){
				        },
				        imagesReady: function(){
			          		this.el.classList.remove('loading');
				        },

				        slideNextTransitionEnd: function () {	
                            let swiper = this.el,
								prevSlide = swiper.querySelector('.swiper-slide-prev'),
								nextSlide = swiper.querySelector('.swiper-slide-next'),
								activeSlide = swiper.querySelector('.swiper-slide-active');
				        },

				        slidePrevTransitionEnd: function () {	
                            let swiper = this.el,
								prevSlide = swiper.querySelector('.swiper-slide-prev'),
								nextSlide = swiper.querySelector('.swiper-slide-next'),
								activeSlide = swiper.querySelector('.swiper-slide-active');

				        },
				        slideChangeTransitionEnd: function(){
							let swiper = this.el,
								prevSlide = swiper.querySelector('.swiper-slide-prev'),
								nextSlide = swiper.querySelector('.swiper-slide-next'),
								activeSlide = swiper.querySelector('.swiper-slide-active');

							gsap.set(prevSlide.querySelector('.px-slider__title'), {opacity:0, y:50});
							gsap.to(activeSlide.querySelector('.px-slider__title'), 1, {opacity:1, y:0,delay:0.3, ease: Power3.easeOut});
							gsap.set(nextSlide.querySelector('.px-slider__title'), {opacity:0, y:50});
							gsap.set(prevSlide.querySelector('.px-slider__desc'), {opacity:0, y:50});
							gsap.to(activeSlide.querySelector('.px-slider__desc'), .5, {opacity:1, y:0,delay:0.4, ease: Power3.easeOut});
							gsap.set(nextSlide.querySelector('.px-slider__desc'), {opacity:0, y:50});
				          	
				        },
				        progress: function(){
							let swiper = this;
							for (let i = 0; i < swiper.slides.length; i++) {
							let slideProgress = swiper.slides[i].progress,
							    innerOffset = swiper.width * interleaveOffset,
							    innerTranslate = slideProgress * innerOffset;
				           
				            swiper.slides[i].querySelector(".px-slider__bg").style.transform =
				              "translateX(" + innerTranslate + "px)";
				          }
				        },
				        touchStart: function() {
							let swiper = this;
							for (let i = 0; i < swiper.slides.length; i++) {
								swiper.slides[i].style.transition = "";
							}
				        },
				        setTransition: function(speed) {
							let swiper = this;
							for (let i = 0; i < swiper.slides.length; i++) {
								swiper.slides[i].style.transition = speed + "ms";
								swiper.slides[i].querySelector(".px-slider__bg").style.transition = speed + "ms";
							}
				        }
				      }
				    };
				let mainSlider = new Swiper(mainSliderSelector, mainSliderOptions);

        	}


        },


        /* ==================================================
          BasicLightbox
        ================================================== */
        lightbox : {

            init : function() {
                let lb = themeToolkit.lightbox;
                if ( document.querySelector('.fx-lightbox') ) {
                    const boxes = document.querySelectorAll('.fx-lightbox');
                    for ( let box of boxes ) {
                        box.addEventListener( 'click', e => {
                            let lbId = box.getAttribute('data-lb-id');
                            if ( lbId === false || lbId === null ) {
                                return;
                            }
                            let content = document.querySelector('#'+lbId);
                            if ( content ) {
                            	let wpFrame = content.querySelector('[data-src]');
                            	if (wpFrame) {
                            		let iSrc = wpFrame.getAttribute('data-src');
                            		wpFrame.setAttribute('src',iSrc);
                            	} 
                            	
                                let bl = basicLightbox.create(
                                    content.innerHTML, {
                                        className: 'fx-cursor fx-cursor-close', 
                                        onClose : function() {
		                                	if ( wpFrame ) {
		                                		wpFrame.src = '';
		                                	}

                                        }
                                    }
                                );
                                bl.show(() => {

                                    document.querySelector('.basicLightbox .lightbox__inner').addEventListener('click', ()=> bl.close() );

                                    theme.cursor.update('.basicLightbox'); 
                                    if ( document.querySelector('#cursor') ) {
                                        document.querySelector('#cursor').classList.add('close');
                                    }

                                    let imgHolder = document.querySelector('.basicLightbox [data-img-src]');
                                    if ( imgHolder ) {
	                                    let imgSrc = imgHolder.getAttribute('data-img-src');
	                            		let newImg = new Image();
	                            		imgHolder.classList.add('lightbox__loading');
										newImg.onload = function () {
											imgHolder.classList.remove('lightbox__loading');
											imgHolder.appendChild(newImg);
											imgHolder.removeAttribute('data-img-src');
											setTimeout(()=>{imgHolder.classList.add('lightbox__loaded')},100);
											; 
										}
										newImg.src = imgSrc;
									}
                                    
                                });
                            }
                        });
                    }
                }
            },

        },


        /* ==================================================
          Events
        ================================================== */
        events : {

            init : function() {
                let event = themeToolkit.events;
                
            },
            list: function() {
                if ( document.querySelector('.events-list .event-list-item') ) {
                    let listEvents = document.querySelectorAll('.events-list .event-list-item');
                    let listContainer = document.querySelector('.events-list');

                    for (let ev of listEvents) {
                         ev.addEventListener("mouseover", e => {
                            listContainer.classList.add('is-hover');
                            ev.classList.add('is-active');
                        });
                        ev.addEventListener("mouseout", e => {
                            listContainer.classList.remove('is-hover');
                            ev.classList.remove('is-active');

                        });
                    }  
                }

            },

        },


        /* ==================================================
          Player 
        ================================================== */
        player : {

			sound          : false,
			bgPlayer       : null,
			BgPlayerPlaying: false,
			isBgPlayer     : false,
			bgSrcInit      : null,
			volInterval    : null,
			volume         : 0.8,
			smoothTrans    : true,
			progressBar    : null,
			mousedown      : false,
			firstLoad      : false,
			moveBar        : false,

            init : function(container) {

                let that = themeToolkit.player;
                let bgPlayer = doc.querySelector( '.bg-player.rp' );
               
                if ( bgPlayer ) {
                    let bgPageAudio = doc.querySelector('.rp-page-audio');
                    that.bgPlayer = bgPlayer; 
                    that.bgSrcInit = bgPlayer.getAttribute('href');
                    if (bgPageAudio) {
                        let src = bgPageAudio.getAttribute('data-audio');
                        that.bgPlayer.setAttribute('href',src);
                    }
                }

                // Set players
                that.setPlayers();

                // Init Controllers
                that.controllers();
            },
            
            setPlayers : function() {
                let that = themeToolkit.player;
                let players = doc.querySelectorAll( '.rp' );
                for ( let p of players ) {
                    if ( p.hasPlayer && p.hasPlayer === true ) {
                        continue;
                    }
                    p.hasPlayer = true;
                    p.addEventListener('click', e => {
                        that.trigger( e.currentTarget );

                        // Prevent link default
                        e.preventDefault();
                    }, true);
                }
            },
            
            controllers : function() {
            	let that = themeToolkit.player;
            	let controllers = document.querySelectorAll('.aplayer-ctrl');

            	if ( controllers.length > 0 ) {
            		for ( let ctrl of controllers  ) {
            			let listID = ctrl.getAttribute('data-list-id');
            			let list = document.getElementById(listID);
            			if ( list ) {
	            			ctrl.addEventListener('click', e => {
	            				let playing = list.querySelector('.rp-list__item.playing');
	            				let paused = list.querySelector('.rp-list__item.paused');
	            				let firstTrack = list.querySelector('.rp-list__item:first-child');

	            				if ( playing || paused ) {
	            					that.togglePlay(that.sound);;
	            				} else {
	            					that.trigger( firstTrack.querySelector('.rp') );
	            				}

		                        // Prevent link default
		                        e.preventDefault();

	            			});
            			}
            			
            		}
            	}

            },

            progress : function() {
                let that = themeToolkit.player;
                let target = that.sound.target;
                let length = that.sound.duration
                let currTime = that.sound.currentTime;
                let totalLength = that.calculateTotalValue(length);
                let currentTime = that.calculateCurrentValue(currTime);

                // If player is on the tracklist
                if ( that.sound.tracklist ) {
                    let elapsedEl = that.sound.listItem.querySelector('.audio-ctrl__elapsed');
                    let totalEl = that.sound.listItem.querySelector('.audio-ctrl__total');
                    let positionBar = that.sound.listItem.querySelector('.audio-ctrl__position');
                    // calculate current value time
                    elapsedEl.innerHTML = currentTime;
                    // calculate total length of value
                    totalEl.innerHTML = totalLength;
                    let percent = 100 * currTime / length;
                    percent = percent.toFixed(2);
                    positionBar.style.width = percent + '%';
                    
                    // Next track
                    if ( currTime >= length ) {
                        that.playNext();
                    }
                }

                // Loading
                if ( that.firstLoad === true ) {
                    if ( currTime > 0 ) {
                        that.firstLoad = false;
                        that.clearStatus();
                        that.addClasses('playing');
                        that.firstLoad === false;
                    }
                }
               
            },

            seek : function(event) {
                let that = themeToolkit.player;
                if ( that.sound.currentTime ) {
                    let positionBar = that.sound.listItem.querySelector('.audio-ctrl__position');
                    let percent = event.offsetX / this.offsetWidth;
                    let jumpTo = percent * that.sound.duration;
                    that.sound.currentTime = jumpTo;
                    let moveTo = 100 * percent;
                    moveTo = moveTo.toFixed(2);
                    positionBar.style.width = moveTo + '%';
                }
            },
            scrub : function(event) {
                let that = themeToolkit.player;
                if ( that.sound.currentTime && that.mousedown) {
                    that.moveBar = true;
                    that.sound.pause();
                    let positionBar = that.sound.listItem.querySelector('.audio-ctrl__position');
                    let percent = event.offsetX / this.offsetWidth;
                    let jumpTo = percent * that.sound.duration;
                    that.sound.currentTime = jumpTo;
                    let moveTo = 100 * percent;
                    moveTo = moveTo.toFixed(2);
                    positionBar.style.width = moveTo + '%';
                }
                if ( that.mousedown === false && that.moveBar === true ) {
                    that.moveBar = false;
                    that.sound.play(); 
                }
            },

            addNewListeners : function() {
                let that = themeToolkit.player;

                // Remove old listeners
                if ( that.progressBar !== null ) {
                    that.progressBar.removeEventListener("click", that.seek);
                    that.progressBar.removeEventListener('mousedown', () => mousedown = true);
                    that.progressBar.removeEventListener('mouseup', () => mousedown = false);
                    that.progressBar.removeEventListener('mousemove', that.scrub);
                }
                
                // Bind progressbar listener
                that.progressBar = that.sound.listItem.querySelector('.audio-ctrl__progress');
                that.progressBar.addEventListener("click", that.seek);
                that.progressBar.addEventListener('mousedown', () => that.mousedown = true);
                that.progressBar.addEventListener('mouseup', () => that.mousedown = false);
                that.progressBar.addEventListener('mousemove', that.scrub );

            },

            trigger : function(target) {
                let that = themeToolkit.player;
                let track_url = target.getAttribute('href');
                let loop = true;
                let currentUrl;
                let init_list = false;
                that.firstLoad = false;
                
                if ( track_url === false || track_url === '#' || track_url === '' ) {
                    return;
                }

                // BG Player
                if ( that.isBgPlayer === true && that.sound) {
                    if ( that.sound.paused ) {
                        that.BgPlayerPlaying = false;
                    } else {
                        that.BgPlayerPlaying = true;
                    }
                }

                // New Track
                if ( that.sound === false ) {
                    that.sound = new Audio(track_url);
                    that.sound.ontimeupdate = that.progress;
                    that.sound.addEventListener('error', that.error );
                    that.sound.target = target;
                    that.firstLoad = true;
                } 

                if ( that.sound.src !== track_url || that.sound.target.isEqualNode(target) === false ) {
                     that.sound.src = track_url;
                     that.firstLoad = true;
                }

                
                if ( that.firstLoad === true ) {

                    // Remove react connection
                    that.sound.reactWIth = null;

                    // React element
                    if (target.getAttribute('data-react-with')) {
                        let reactId = target.getAttribute('data-react-with');
                        if ( document.getElementById(reactId) ) {
                            that.sound.reactWIth = document.getElementById(reactId);
                        }
                    }

                    // Track from the list
                    if ( target.getAttribute('data-list')) {
                        let listId = target.getAttribute('data-list');
                        that.sound.tracklist = document.getElementById( listId );
                        that.sound.listItem = themeToolkit.getClosest(target, '.rp-list__item');
                        that.sound.listLength = that.sound.tracklist.querySelectorAll('.rp-list__item').length;
                        that.sound.index = that.listIndex(that.sound.listItem);
                        that.sound.loop = false;
                        that.addNewListeners();
                    } 

                    // Single
                    if ( target.getAttribute('data-list') === null ) {
                        that.sound.loop = true;
                        that.sound.tracklist = null;
                        that.sound.listItem = null;
                    }

                    // BG Player
                    if ( target.classList.contains('bg-player') ) {
                        that.isBgPlayer = true; 
                    } else {
                        that.isBgPlayer = false; 
                    }

                }


                that.sound.target = target;
                that.togglePlay(that.sound);

               
            },
            
            clearStatus :  function() {

                // Grab ready players
                let playing = doc.querySelectorAll( '.playing' );
                let paused = doc.querySelectorAll( '.paused' );
                let loading = doc.querySelectorAll( '.loading' );

                for ( let p of playing ) {
                    p.classList.remove('playing');
                }
                for ( let p of paused ) {
                    p.classList.remove('paused');
                }
                 for ( let p of loading ) {
                    p.classList.remove('loading');
                }
                
            },

            addClasses : function(cls) {
                let that = themeToolkit.player;

                that.sound.target.classList.add(cls);
                
                if ( that.sound.listItem ) {
                    that.sound.listItem.classList.add(cls);
                }
                // react with
                if (that.sound.reactWIth) {
                    that.sound.reactWIth.classList.add(cls);
                }
            },
            
            togglePlay: function(media) {
                let that = themeToolkit.player;
                let target = media.target;

                that.clearStatus();
                if ( that.firstLoad === true ) {
                    that.addClasses('loading');
                    setTimeout(()=> { media.play(); }, 150);
                    
                } else {
                     if ( media.paused ) {
                        that.addClasses('playing');
                        setTimeout(()=> { media.play(); }, 150);
                    } else {
                        that.addClasses('paused');
                        media.pause();
                    }
                }
               
            },

            playNext : function() {
                 let that = themeToolkit.player;

                 if (that.sound.tracklist) {
                 	let isGoodTrack = that.sound.tracklist.querySelectorAll('.rp-list__item:not(.is-broken-track)');
                 	if ( isGoodTrack.length !== 0 ) {
	                    let listLength = that.sound.listLength;
	                    let thisIndex = that.sound.index;
	                    let nextIndex = thisIndex;
	                    nextIndex++

	                    if ( nextIndex === listLength ) {
	                        nextIndex = 0;
	                    }

	                    let list = that.sound.tracklist.querySelectorAll('.rp-list__item');
	                    let nextEl = list[nextIndex].querySelector('.rp');
	                    if ( nextEl ) {
	                        that.trigger(nextEl);
	                    }
                	}
                 }

            },

            setVolDown : function(callback) {
                let that = themeToolkit.player;
                let v = that.sound.volume;
                that.volInterval = setInterval(function () {
                    // Only fade if past the fade out point or not at zero already
                    if (v > 0.0) {
                        v -= 0.1;
                        if ( v < 0 ) {
                            that.sound.volume = 0;
                        } else {
                            that.sound.volume = v;
                        }
                    }
                    // When volume at zero stop all the intervalling
                    if (that.sound.volume === 0.0) {
                        clearInterval(that.volInterval);
                        callback();
                    }
                }, 200);
            },

            setVolUp : function(callback) {
                let that = themeToolkit.player;
                let v = 0;
                that.volInterval = setInterval(function () {

                    // Only fade if past the fade out point or not at zero already
                    if (v < that.volume) {
                        v += 0.1;
                        if ( v > that.volume ) {
                            that.sound.volume = that.volume;
                        } else {
                            that.sound.volume = v;
                        }
                    }
                    // When volume at zero stop all the intervalling
                    if (that.sound.volume === that.volume) {
                        clearInterval(that.volInterval);
                    }
                }, 200);
            },

            smooth : function(targetSrc) {
                let that = themeToolkit.player;

                // Clear interval
                clearInterval(that.volInterval);

                if ( that.smoothTrans ) {

                    // Down volume
                    that.setVolDown(function(){

                        that.sound.src = targetSrc;
                        that.sound.volume = 0;
                        that.firstLoad = true;
                        that.togglePlay(that.sound, that.bgPlayer);

                        // Up volume on new track
                         that.setVolUp();

                    });

                } else {

                    that.firstLoad = true;
                    that.sound.src = src;
                    that.togglePlay(that.sound, that.bgPlayer);
                }

            },

            // BG Player
            setBgPlayer : function(){
                let that = themeToolkit.player;

                if ( that.bgPlayer === null ) {
                    return;
                }

                let bgPageAudio = doc.querySelector('.rp-page-audio');
                let srcInit = that.bgSrcInit;
                let src = that.bgPlayer.getAttribute('href');
                
             
                // Set src
                if (bgPageAudio) {
                    src = bgPageAudio.getAttribute('data-audio');
                } else if ( src !== srcInit ) {
                    src = srcInit;
                }
                
                // Reset Tracklist
                that.sound.loop = true;
                that.sound.tracklist = null;
                that.sound.listItem = null;
                that.bgPlayer.setAttribute('href',src);

                if ( that.sound ) {
                    that.sound.target = that.bgPlayer;
                    if ( that.sound.paused === false && that.sound.currentSrc !== src ) {
                        that.smooth(src);
                      
                    } else if ( that.sound.paused && that.sound.currentSrc !== src ) {
                         that.sound.src = src;
                         that.sound.volume = that.volume;
                    }

 
                }

            },

            calculateTotalValue : function(currentTime) {
                if ( isNaN(currentTime) ) {
                    currentTime = 0;
                }
                let current_hour = parseInt(currentTime / 3600) % 24,
                    current_minute = parseInt(currentTime / 60) % 60,
                    current_seconds_long = currentTime % 60,
                    current_seconds = current_seconds_long.toFixed(),
                    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

                return current_time;
            },

            calculateCurrentValue : function(currentTime) {
                if ( isNaN(currentTime) ) {
                    currentTime = 0;
                }
                let current_hour = parseInt(currentTime / 3600) % 24,
                    current_minute = parseInt(currentTime / 60) % 60,
                    current_seconds_long = currentTime % 60,
                    current_seconds = current_seconds_long.toFixed(),
                    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

                return current_time;
            },

            listIndex : function(el) {
                var i=0;
                while(el.previousElementSibling ) {
                    el=el.previousElementSibling;
                    i++;
                }
                return i;
            },

            error : function(e) {
                let that = themeToolkit.player;

                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        console.log('You aborted the media playback.'); break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        console.log('A network error caused the media download to fail.'); break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        console.log('The media playback was aborted due to a corruption problem or because the media used features your browser did not support.'); break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.log('The media could not be loaded, either because the server or network failed or because the format is not supported.'); break;
                    default:
                        console.log('An unknown media error occurred.');
                }

                that.clearStatus();
                that.addClasses('is-broken-track');
                that.playNext();

            },

            update : function() {
                let that = themeToolkit.player;
                if ( that.sound && that.sound.target ) {
                    
                    // BG Player is paused and tracklist is played                    
                    if ( that.sound.target.classList.contains('bg-player') === false && that.BgPlayerPlaying === false ) {
                        // Down volume
                        that.setVolDown(function(){

                            that.sound = false;
                            that.clearStatus();

                        });
                       
                    } else {

                        // BG Player is played
                        that.setBgPlayer();

                    }
                        
                } 
                
                // Set Players
                that.setPlayers();

                // Controllers
                that.controllers();
               
            }
           
        },


        /* ==================================================
          Disqus 
        ================================================== */
        disqus : function() {
            let disqus = document.querySelector('#disqus_thread');
            if (disqus) {

                let disqusIdentifier = document.querySelector('#disqus_thread').getAttribute('data-post_id')
                  , disqusShortname = document.querySelector('#disqus_thread').getAttribute('data-disqus_shortname')
                  , disqusTitle = document.querySelector('#disqus_title').textContent
                  , disqusUrl = window.location.href
                  , protocol = location.protocol;
                /* * * Disqus Reset Function * * */
                if (typeof DISQUS !== 'undefined') {
                    DISQUS.reset({
                        reload: true,
                        config: function() {
                            this.page.identifier = disqusIdentifier;
                            this.page.url = disqusUrl;
                            this.page.title = disqusTitle;
                        }
                    });
                } else {
                    let dsq = document.createElement('script');
                    dsq.type = 'text/javascript';
                    dsq.async = true;
                    dsq.src = protocol + '//' + disqusShortname + '.disqus.com/embed.js';
                    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                }
            }
        },


        /* ==================================================
          Helpers 
        ================================================== */
        getClosest : function (elem, selector) {

            // Element.matches() polyfill
            if (!Element.prototype.matches) {
                Element.prototype.matches =
                    Element.prototype.matchesSelector ||
                    Element.prototype.mozMatchesSelector ||
                    Element.prototype.msMatchesSelector ||
                    Element.prototype.oMatchesSelector ||
                    Element.prototype.webkitMatchesSelector ||
                    function(s) {
                        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                            i = matches.length;
                        while (--i >= 0 && matches.item(i) !== this) {}
                        return i > -1;
                    };
            }

            // Get the closest matching element
            for ( ; elem && elem !== document; elem = elem.parentNode ) {
                if ( elem.matches( selector ) ) return elem;
            }
            return null;

        },


        /* ==================================================
          GlitchSlider 
        ================================================== */
        glitchSlider : {
            el      : null,
            inner   : null,
            slides  : [],
            bullets : [],
            renderer: null,
            scene   : null,
            clock   : null,
            camera  : null,
            mat     : null,
            images : [],
            mesh : null,
            data : {
                current: 0,
                selected: 0,
                next: 1,
                total: 0,
                delta: 0
            },
            state : {
                animating: false,
                text: false,
                initial: true
            },
            textures : null,

            frag : `
                varying vec2 vUv;

                uniform sampler2D texture1;
                uniform sampler2D texture2;
                uniform sampler2D disp;

                uniform float dispPower;
                uniform float intensity;

                uniform vec2 size;
                uniform vec2 res;


                void main() {
                  vec2 uv = vUv;
                  
                  vec4 disp = texture2D(disp, uv);
                  vec2 dispVec = vec2(disp.x, disp.y);
                  
                  vec2 distPos1 = uv + (dispVec * intensity * dispPower);
                  vec2 distPos2 = uv + (dispVec * -(intensity * (1.0 - dispPower)));
                  
                  vec4 _texture1 = texture2D(texture1, distPos1);
                  vec4 _texture2 = texture2D(texture2, distPos2);
                  
                  gl_FragColor = mix(_texture1, _texture2, dispPower);
                }
                `,

            vert : `
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,


            init : function() {
            	if ( typeof THREE === 'undefined' ) {
            		return;
            	}
                let slider = themeToolkit.glitchSlider;

                slider.kill();

                if ( document.querySelector('.glitch-slider') ) {

                    slider.el = document.querySelector('.glitch-slider');
                     
                    slider.inner = slider.el.querySelector('.glitch-slider__inner');
                    slider.slides = [...slider.el.querySelectorAll('.glitch-slide')];
                    slider.bullets = [...slider.el.querySelectorAll('.glitch-slider-bullet')];
                    
                    // Images
                    slider.slides.forEach( (slide, index) => {
                        slider.images.push( slide.getAttribute('data-slide-bg') );

                    } );

                    // Images length
                    slider.data.total = slider.images.length - 1;

                    slider.setup();
                    slider.cameraSetup();
                    slider.loadTextures();
                    slider.createMesh();
                    slider.setStyles();

                }

            },

            setStyles : function() {
                let slider = themeToolkit.glitchSlider;

                slider.slides.forEach((slide, index) => {
                    if (index === 0) return;
                    gsap.set(slide, { autoAlpha: 0 });
                });

                slider.bullets.forEach((bullet, index) => {
                    if (index === 0) return;

                    let txt = bullet.querySelector('.glitch-slider-bullet__text');

                    gsap.set(txt, {
                        alpha: 0.25 });


                });
            },

            cameraSetup : function() {
                let slider = themeToolkit.glitchSlider;

                slider.camera = new THREE.PerspectiveCamera(
                  45,
                  window.innerWidth / window.innerHeight,
                  1,
                  1000
                );
  
                slider.renderer.setSize(window.innerWidth, window.innerHeight);
                slider.camera.position.z = 1000;
            },

            setup : function() {

                let slider = themeToolkit.glitchSlider;

                slider.scene = new THREE.Scene();
                slider.background = new THREE.Color(0x333333);
                slider.clock = new THREE.Clock(true);
                slider.renderer = new THREE.WebGLRenderer({ alpha: true });
                slider.inner.appendChild(slider.renderer.domElement);
            },

            loadTextures : function() {
                let slider = themeToolkit.glitchSlider;

                let loader = new THREE.TextureLoader();
                loader.crossOrigin = '';

                slider.textures = [];
                slider.images.forEach((image, index) => {
                    let texture = loader.load(image + '?v=' + Date.now(), slider.render.bind(this, index));

                    texture.minFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;

                    if (index === 0 && slider.mat) {
                        slider.mat.uniforms.size.value = [
                        texture.image.naturalWidth,
                        texture.image.naturalHeight];
                    }

                    slider.textures.push(texture);
                });
                slider.disp = loader.load(theme.globals.path+'/images/disp-texture.png', slider.render);
                slider.disp.magFilter = slider.disp.minFilter = THREE.LinearFilter;
               
            },

            createMesh : function() {
                let slider = themeToolkit.glitchSlider;

                slider.mat = new THREE.ShaderMaterial({
                  uniforms: {
                    dispPower: { type: 'f', value: 0.0 },
                    intensity: { type: 'f', value: 0.5 },
                    res: { 
                        type: "v2",
                        value: new THREE.Vector2(window.innerWidth, window.innerHeight) 
                    },
                    size: { value: new THREE.Vector2(1, 1) },
                    texture1: { type: 't', value: slider.textures[0] },
                    texture2: { type: 't', value: slider.textures[1] },
                    disp: { type: 't', value: slider.disp } },

                    transparent: true,
                    vertexShader: slider.vert,
                    fragmentShader: slider.frag });


                let geometry = new THREE.PlaneBufferGeometry(
                    1920,
                    1080,
                1);
                slider.mesh = new THREE.Mesh(geometry, slider.mat);

                slider.scene.add(slider.mesh);
            },

            afterLoad : function() {
                let slider = themeToolkit.glitchSlider;
                let current = slider.slides[slider.data.current];
                let currentImages = current.querySelectorAll('.glitch-slide__img');
                let currentBullet = slider.bullets[slider.data.current];

                let tl = gsap.timeline({ paused: true });

                tl.to( slider.el, {opacity:1, duration: 1}, 0 );
                
                tl.fromTo( '.glitch-slider__bullets', 1, {opacity:0, y:100 }, {opacity: 1, y:0, ease: Power4.easeOut }, 1 );
                tl.fromTo( '.glitch-slider-prev', 1, {opacity:0, y:100 }, {opacity: 1, y:0, ease: Power4.easeOut }, 1 );
                tl.fromTo( '.glitch-slider-next', 1, {opacity:0, y:100 }, {opacity: 1, y:0, ease: Power4.easeOut }, 1 );
                tl.staggerFromTo(currentImages, 1.5, {opacity: 0, y: '-100%' },{opacity: 1, y: 1, ease: Expo.easeInOut }, 0.075, 0.5, function(){
                	current.classList.add('done');
                	currentBullet.classList.add('is-active');
                });

                setTimeout( e=> {
                	let title = current.querySelector('.glitch-slider__title');
	                let desc = current.querySelector('.glitch-slider__desc');
	                theme.fx.autoType(title);
	                theme.fx.randomType.add(desc);

                }, 1500);
                

                tl.play();
                slider.el.classList.add('is-active');
                slider.listeners();

            },
            transitionNext : function() {
                let slider = themeToolkit.glitchSlider;

                gsap.to(slider.mat.uniforms.dispPower, 1.5, {
	                value: 1,
	                ease: Expo.easeInOut,
	                onUpdate: slider.render,
	                onComplete: () => {
	                	next.classList.add('done');
	                	current.classList.remove('current-slider');
	                	next.classList.remove('next-slider');

	                    slider.mat.uniforms.dispPower.value = 0.0;
	                    slider.changeTexture();
	                    slider.render.bind(slider);
	                    slider.data.current = slider.data.selected;
	                    slider.state.animating = false;

               		} 
            	});


                let current = slider.slides[slider.data.current];
                let next = slider.slides[slider.data.next];

                current.classList.add('current-slider');
                next.classList.add('next-slider');

                let currentText = current.querySelectorAll('.js-slider__text');
                let nextText = next.querySelectorAll('.js-slider__text');

                let currentImages = current.querySelectorAll('.glitch-slide__img');
                let nextImages = next.querySelectorAll('.glitch-slide__img');

                let currentBullet = slider.bullets[slider.data.current];
                let nextBullet = slider.bullets[slider.data.next];

                let currentBulletTxt = currentBullet.querySelectorAll('.glitch-slider-bullet__text');
                let nextBulletTxt = nextBullet.querySelectorAll('.glitch-slider-bullet__text');


                let tl = gsap.timeline({ paused: true });

                if (slider.state.initial) {
                    slider.state.initial = false;
                }

                tl.staggerFromTo(currentImages, 1, { opacity: 1, y: 0 }, { opacity:0, y: '-100%',  ease: Expo.easeInOut }, 0);
                tl.to( currentText, 0.8, {opacity:0, y:-50, ease: Power4.easeOut },0 );
                tl.set( nextText, {opacity:1,y:0});

                current.classList.remove('done');
                nextBullet.classList.add('is-active');
                currentBullet.classList.remove('is-active');
                
                tl.set(current, { autoAlpha: 0 }).
                set(next, {autoAlpha: 1 }, 1);

                tl.staggerFromTo(nextImages, 1, {opacity: 0, y: '100%' },{opacity: 1, y: 0, ease: Expo.easeInOut }, 0, 1);

                // Titles and slider animation classes
              	setTimeout( e=>{

                    let oldTitle = current.querySelector('.glitch-slider__title');
                    let title = next.querySelector('.glitch-slider__title');
                    let oldDesc = current.querySelector('.glitch-slider__desc');
                    let desc = next.querySelector('.glitch-slider__desc');
                    oldTitle.classList.remove('done', 'autotype-started')
                    theme.fx.autoType(title);

                    oldDesc.classList.remove('done');
                    theme.fx.randomType.add(desc);
                }, 1100)


                tl.play();
            },
  
            onWindowResize : function() {
                let slider = themeToolkit.glitchSlider;
                
                slider.camera.aspect = window.innerWidth/window.innerHeight;
                slider.camera.updateProjectionMatrix();
                slider.mat.uniforms.texture1.value = slider.textures[slider.data.current];
                slider.mat.uniforms.texture2.value = slider.textures[slider.data.next];
                slider.renderer.setSize(window.innerWidth, window.innerHeight);
                slider.renderer.render(slider.scene, slider.camera);

            },

            nextSlide : function() {
                let slider = themeToolkit.glitchSlider;

                if (slider.state.animating) return;
                slider.state.animating = true;
                let next = slider.data.current === slider.data.total ? 0 : slider.data.current + 1;

                slider.data.next = next;
                slider.data.selected = next;
                slider.changeTexture();
                slider.transitionNext();
            },

            prevSlide : function() {
                let slider = themeToolkit.glitchSlider;

                if (slider.state.animating) return;
                slider.state.animating = true;
                let prev = slider.data.current === 0 ? slider.data.total : slider.data.current - 1;

                slider.data.next = prev;
                slider.data.selected = prev;
                slider.changeTexture();
                slider.transitionNext();
            },

            bulletsNav : function(event) {
                event.preventDefault();

                let slider = themeToolkit.glitchSlider;
                if (slider.state.animating) return;

                let selectedSLide =0;
                let el = event.target;
                el = el.parentNode.parentNode;

                // Get index
                while(el.previousElementSibling ) {
                    el=el.previousElementSibling;
                    selectedSLide++;
                }
                if ( slider.data.current === selectedSLide ) return;
                slider.state.animating = true;
                slider.data.next = selectedSLide;
                slider.data.selected = selectedSLide;
                slider.changeTexture();
                slider.transitionNext();
            
            },

            arrowsNav : function(event) {
                event.preventDefault();
                let slider = themeToolkit.glitchSlider;
                let el = event.currentTarget;
                
                if ( el.classList.contains('glitch-slider-next') ) {
                    slider.nextSlide();
                } else {
                    slider.prevSlide();
                }
            
            },
            changeTexture : function() {
                let slider = themeToolkit.glitchSlider;
                slider.mat.uniforms.texture1.value = slider.textures[slider.data.current];
                slider.mat.uniforms.texture2.value = slider.textures[slider.data.next];

            },
            listeners : function(){
                let slider = themeToolkit.glitchSlider;
                window.addEventListener("resize", slider.onWindowResize,false);
                window.addEventListener('wheel', slider.nextSlide, { passive: true });
                document.querySelector('.glitch-slider__bullets').addEventListener('click', slider.bulletsNav, false);
                document.querySelector('.glitch-slider__arrows .glitch-slider-prev').addEventListener('click', slider.arrowsNav, false);
                document.querySelector('.glitch-slider__arrows .glitch-slider-next').addEventListener('click', slider.arrowsNav, false);
            },
            render : function(nr, texture) {
                let slider = themeToolkit.glitchSlider;
                slider.renderer.render(slider.scene, slider.camera);
                if ( nr === slider.data.total ) {
                    slider.afterLoad();
                }
                
            },

            kill : function() {
                let slider = themeToolkit.glitchSlider;

                if ( slider.renderer !== null ) {
                    window.removeEventListener("resize", slider.onWindowResize,false);
                    window.removeEventListener('wheel', slider.nextSlide, { passive: true });
                    slider.renderer.dispose();
                    slider.scene.dispose();
                    slider.mat = null;
                    slider.images = [];
                    slider.data = {
                        current: 0,
                        next: 1,
                        total: 0,
                        delta: 0
                    };
                    slider.state = {
                        animating: false,
                        text: false,
                        initial: true
                    };
                    slider.textures = null;
                }

            },

        },


        /* ==================================================
          Glitch FX 
        ================================================== */
        glitchGL : {
            imageSrc : null,
            renderer : null,
            scene : null,
            camera : null,
            texture : null,
            mesh : null,
            textureProgress : 0,
            currentIndex : 0,
            nextIndex : 0,
            time : 0,   
            data : [{}],
            impulses : null,
            firstRender : false,
            canvas : null,
            followSpot : null,
            slidesSpot : null,
            loopRequest : null,
            anim : {},
            follow : {
                x: 0,
                y: 0
            },

            vertex : `
                #define PI 3.14159265359
                uniform float u_waveIntensity;
                uniform float u_offset;
                uniform float u_progress;
                uniform float u_direction;
                uniform float u_time;
                varying vec2 vUv;
                void main(){
                    vec3 pos = position.xyz;
                    float distance = length(uv.xy - 0.5 );
                    float sizeDist = length(vec2(0.5,0.5));
                    float normalizedDistance = distance/sizeDist ;
                    float stickOutEffect = normalizedDistance ;
                    float stickInEffect = -normalizedDistance ;
                    float stickEffect = mix(stickOutEffect,stickInEffect, u_direction);
                    float stick = 0.5;
                    float waveIn = u_progress*(1. / stick); 
                    float waveOut =  -( u_progress - 1.) * (1./(1.-stick) );
                    waveOut = pow(smoothstep(0.,1.,waveOut),0.7);
                    float stickProgress = min(waveIn, waveOut);
                    float offsetInProgress = clamp(waveIn,0.,1.);
                    float offsetOutProgress = clamp(1.-waveOut,0.,1.);
                    float offsetProgress = mix(offsetInProgress,offsetOutProgress,u_direction);
                    float stickOffset = u_offset;
                    pos.z += stickEffect * stickOffset * stickProgress  - u_offset * offsetProgress;
                    pos.z += sin(distance * 8. - u_time * 2. )  * u_waveIntensity;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    vUv = uv;
                }
            `,
            fragment : `
                uniform vec2 u_resolution;
                uniform sampler2D u_texture;
                uniform sampler2D u_texture2;
                uniform vec2 u_textureFactor;
                uniform vec2 u_texture2Factor;
                uniform float u_textureProgress;
                uniform vec2 u_rgbPosition;
                uniform vec2 u_rgbVelocity;
                varying vec2 vUv;
                vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
                    return uvs * factor - factor /2. + 0.5;
                }
                void main(){
                    vec2 normalizedRgbPos = u_rgbPosition / u_resolution;
                    normalizedRgbPos.y = 1. - normalizedRgbPos.y; 
                    vec2 vel = u_rgbVelocity;
                    float dist = distance(normalizedRgbPos + vel / u_resolution, vUv.xy);
                    float ratio = clamp(1.0 - dist * 5., 0., 1.);
                    vec4 tex1 = vec4(1.);
                    vec4 tex2 = vec4(1.);
                    vec2 uv = vUv;
                    uv.x -= sin(uv.y) * ratio / 100. * (vel.x + vel.y) / 7.;
                    uv.y -= sin(uv.x) * ratio / 100. * (vel.x + vel.y) / 7.;
                    tex1.r = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor )).r;
                    tex2.r = texture2D(u_texture2, centeredAspectRatio(uv, u_textureFactor )).r;
                    uv.x -= sin(uv.y) * ratio / 150. * (vel.x + vel.y) / 7.;
                    uv.y -= sin(uv.x) * ratio / 150. * (vel.x + vel.y) / 7.;
                    tex1.g = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor )).g;
                    tex2.g = texture2D(u_texture2, centeredAspectRatio(uv, u_textureFactor )).g;
                    uv.x -= sin(uv.y) * ratio / 300. * (vel.x + vel.y) / 7.;
                    uv.y -= sin(uv.x) * ratio / 300. * (vel.x + vel.y) / 7.;
                    tex1.b = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor )).b;
                    tex2.b = texture2D(u_texture2, centeredAspectRatio(uv, u_textureFactor )).b;
                    vec4 fulltex1 = texture2D(u_texture, centeredAspectRatio(vUv, u_textureFactor) );
                    vec4 fulltex2 = texture2D(u_texture2, centeredAspectRatio(vUv, u_texture2Factor));
                    vec4 mixedTextures =  mix(tex1,tex2,u_textureProgress);
                    gl_FragColor = mixedTextures;
                }
            `,

            init :  function() {
            	if ( typeof THREE === 'undefined' ) {
            		return;
            	}

                const gl = themeToolkit.glitchGL;

                const imgHolder = document.getElementById('fx-wgl-glitch');

                // Kill old threejs
                gl.kill();

                if ( imgHolder ) {

                    gl.imageSrc = imgHolder.getAttribute('data-image-src');
                    gl.canvas = document.getElementById('fx-wgl-glitch-canvas');
                    gl.setup();
                    gl.createPlane();
                    gl.render();

                    if (gl.anim.animInterval) clearInterval(gl.anim.animInterval);
                    if (gl.anim.animTimeout) clearTimeout(gl.anim.animTimeout);
                    gl.anim.animTimeout = setTimeout(gl.startAnim, 8000);

                    window.addEventListener('resize', gl.onWindowResize, false);
                    window.addEventListener("mousemove", gl.mouseMove, false);
                }

            },

            setup : function() {
                const gl = themeToolkit.glitchGL;
                
                gl.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
                gl.camera.position.z = 0.1;

                gl.scene = new THREE.Scene();
                gl.camera.lookAt = gl.scene.position;

                // Renderer
                gl.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, canvas: gl.canvas });
                gl.renderer.setSize(window.innerWidth, window.innerHeight);
                gl.renderer.setPixelRatio(window.devicePixelRatio);
                
                gl.texture = new THREE.TextureLoader().load( gl.imageSrc,
                    gl.calculateAspectRatioFactor.bind(this, 0)
                );
                gl.impulses = gl.data.map(d => new THREE.Vector2(1, 1));

            },

            render: function() {
                const gl = themeToolkit.glitchGL;
                 if (!gl.firstRender) {
                    gl.firstRender = true;
                }
                gl.renderer.render(gl.scene, gl.camera);
            },
         

            getViewSize: function () {
                const gl = themeToolkit.glitchGL;
                const fovInRadians = (gl.camera.fov * Math.PI) / 180;
                const viewSize = Math.abs(
                    gl.camera.position.z * Math.tan(fovInRadians / 2) * 2
                );

                return viewSize;
            },

            getPlaneSize : function () {
                const gl = themeToolkit.glitchGL;
                const viewSize = gl.getViewSize();
                return {width: viewSize * 0.95, height: viewSize};
            },

            calculateAspectRatioFactor : function(nr, texture) {
                const gl = themeToolkit.glitchGL;
                
                if ( gl.canvas.classList.contains('is-loaded') === false ) {
                    gl.canvas.classList.add('is-loaded');  
                }
                
                const plane = gl.getPlaneSize();
                const windowRatio = window.innerWidth / window.innerHeight;
                const rectRatio = (plane.width / plane.height) * windowRatio;
                const imageRatio = gl.texture.image.width / gl.texture.image.height;

                let factorX = 1;
                let factorY = 1;
                if (rectRatio > imageRatio) {
                    factorX = 1;
                    factorY = (1 / rectRatio) * imageRatio;
                } else {
                    factorX = (1 * rectRatio) / imageRatio;
                    factorY = 1;
                }

                gl.impulses[nr] = new THREE.Vector2(factorX, factorY);
                if (gl.currentIndex === nr) {
                    gl.mesh.material.uniforms.u_textureFactor.value = gl.impulses[nr];
                    gl.mesh.material.uniforms.u_textureFactor.needsUpdate = true;
                }
                if (gl.nextIndex === nr) {
                    gl.mesh.material.uniforms.u_texture2Factor.value = gl.impulses[nr];
                    gl.mesh.material.uniforms.u_texture2Factor.needsUpdate = true;
                }
                if (gl.firstRender) {
                    gl.loadedEntries++;
                    gl.render();
                }
            },

            createPlane : function () {
                const gl = themeToolkit.glitchGL;
                const viewSize = gl.getViewSize();
                const {width, height} = gl.getPlaneSize();

                const segments = 60;
                const geometry = new THREE.PlaneBufferGeometry(
                    width,
                    height,
                    segments,
                    segments
                );

                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        u_texture: {type: "t", value: gl.texture},
                        u_textureFactor: {type: "f", value: gl.impulses[gl.currentIndex]},
                        u_texture2: {type: "t", value: gl.texture},
                        u_texture2Factor: {type: "f", value: gl.impulses[gl.nextIndex]},
                        u_textureProgress: {type: "f", value: gl.textureProgress},
                        u_offset: {type: "f", value: 8},
                        u_progress: {type: "f", value: 0},
                        u_direction: {type: "f", value: 1},
                        u_effect: {type: "f", value: 0},
                        u_time: {type: "f", value: gl.time},
                        u_waveIntensity: {type: "f", value: 0},
                        u_resolution: {
                            type: "v2",
                            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                        },
                        u_rgbPosition: {
                            type: "v2",
                            value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2)
                        },
                        u_rgbVelocity: {type: "v2", value: new THREE.Vector2(0, 0)}
                    },
                    vertexShader: gl.vertex,
                    fragmentShader: gl.fragment,
                    side: THREE.DoubleSide
                });
                const mesh = new THREE.Mesh(geometry, material);
                gl.scene.add(mesh);
                gl.mesh = mesh;
            },

            onWindowResize : function() {
                const gl = themeToolkit.glitchGL;
                gl.renderer.setSize(window.innerWidth, window.innerHeight)
                gl.mesh.material.uniforms.u_resolution.value = new THREE.Vector2(
                    window.innerWidth,
                    window.innerHeight
                );
                gl.calculateAspectRatioFactor(0, gl.texture);

            },

            updateStickEffect : function ({ direction }) {
                const gl = themeToolkit.glitchGL;
                gl.mesh.material.uniforms.u_direction.value = direction;

            },

            updateRgbEffect : function ({position, velocity}) {
                const gl = themeToolkit.glitchGL;
                gl.mesh.material.uniforms.u_rgbPosition.value = new THREE.Vector2(
                    position.x,
                    position.y
                );
                gl.mesh.material.uniforms.u_rgbVelocity.value = new THREE.Vector2(
                    velocity.x,
                    velocity.y
                );

                if (!gl.loopRequest) {
                    gl.render();
                }
            },

            mouseMove : function (e) {
                const gl = themeToolkit.glitchGL;
                if (gl.anim.animInterval) clearInterval(gl.anim.animInterval);
                if (gl.anim.animTimeout) clearTimeout(gl.anim.animTimeout);
                gl.anim.animTimeout = setTimeout(gl.startAnim, 2000);
                gl.onMouseMove(e);
            },

            onMouseMove : function (ev) {
                const gl = themeToolkit.glitchGL;

                // Move
                var decimalX = ev.clientX / window.innerWidth - 0.5;
                var decimalY = ev.clientY / window.innerHeight - 0.5;
                gsap.to(gl.canvas, 1, { y: 40 * decimalY, x: 40 * decimalX, ease: 'power3.out' });

                // Texture
                if (gl.followSpot) {
                    gl.followSpot.stop();
                    gl.followSpot = null;
                }

                gl.followSpot = gl.reach({
                    from: {x: gl.follow.x, y: gl.follow.y},
                    to: {x: ev.clientX, y: ev.clientY},
                    velocity: {x: gl.follow.vx * 100, y: gl.follow.vy * 100},
                    stiffness: 50,
                    damping: 50,
                    mass: 1
                }).start({
                    update: position => {
                        const velocity = {
                            x: position.x - gl.follow.x,
                            y: position.y - gl.follow.y
                        };
                        gl.updateRgbEffect({position, velocity});
                        gl.follow = {
                            x: position.x,
                            y: position.y,
                            vx: velocity.x,
                            vy: velocity.y
                        };
                    },
                    complete: () => {
                        gl.updateRgbEffect({
                            position: gl.follow,
                            velocity: {x: 0, y: 0}
                        });
                        gl.follow.vx = 0;
                        gl.follow.vy = 0;
                    }
                });
            },

            reach : function ({from, to, restDelta = 0.01}) {
                let current = Object.assign({}, from);
                let keys = Object.keys(from);

                let raf = {
                    current: null
                };

                let _update = function (update, complete) {
                    if (keys.length === 0) {
                        cancelAnimationFrame(raf.current);
                        raf.current = null;

                        complete(current);
                        return;
                    }

                    let cacheKeys = keys.slice();
                    for (var i = keys.length, val, key; i >= 0; i--) {
                        key = keys[i];
                        val = current[key] + (to[key] - current[key]) * 0.1;
                        if (Math.abs(to[key] - val) < restDelta) {
                            current[key] = to[key];
                            // Remove key
                            keys.splice(i, 1);
                            // Move i down by pne
                            i--;
                        } else {
                            current[key] = val;
                        }
                    }

                    update(current);
                    raf.current = requestAnimationFrame(_update);
                };
                return {
                    start: function ({update, complete}) {
                        _update = _update.bind(null, update, complete);
                        raf.current = requestAnimationFrame(_update);
                        return {
                            stop: function () {
                                cancelAnimationFrame(raf.current);
                                raf.current = null;
                            }
                        };
                    }
                };
            },
            scheduleLoop : function () {
                const gl = themeToolkit.glitchGL;
                if (gl.loopRequest) return;
                gl.loop();
            },

            loop : function () {
                const gl = themeToolkit.glitchGL;
                gl.render();
                gl.time += 0.1;
                gl.mesh.material.uniforms.u_time.value = gl.time;
                gl.loopRequest = requestAnimationFrame(gl.loop);
            },

            cancelLoop : function () {
                const gl = themeToolkit.glitchGL;
                cancelAnimationFrame(gl.loopRequest);
                gl.loopRequest = null;
            },


            cords : [
            [
                {clientX: 858, clientY: 392, delay: 30},
                {clientX: 849, clientY: 414, delay: 31},
                {clientX: 840, clientY: 430, delay: 32},
                {clientX: 827, clientY: 447, delay: 32},
                {clientX: 819, clientY: 457, delay: 33},
                {clientX: 806, clientY: 470, delay: 33},
                {clientX: 793, clientY: 481, delay: 33},
                {clientX: 779, clientY: 493, delay: 32},
                {clientX: 755, clientY: 512, delay: 54},
                {clientX: 740, clientY: 523, delay: 33},
                {clientX: 728, clientY: 530, delay: 32},
                {clientX: 715, clientY: 536, delay: 32},
                {clientX: 704, clientY: 540, delay: 33},
                {clientX: 691, clientY: 544, delay: 32},
                {clientX: 676, clientY: 545, delay: 33},
                {clientX: 658, clientY: 546, delay: 31},
                {clientX: 640, clientY: 546, delay: 32},
                {clientX: 618, clientY: 545, delay: 33},
                {clientX: 594, clientY: 542, delay: 33},
                {clientX: 568, clientY: 539, delay: 35},
                {clientX: 542, clientY: 534, delay: 31},
                {clientX: 518, clientY: 528, delay: 30},
                {clientX: 491, clientY: 521, delay: 30},
                {clientX: 467, clientY: 514, delay: 32},
                {clientX: 444, clientY: 505, delay: 32},
                {clientX: 420, clientY: 494, delay: 32},
                {clientX: 400, clientY: 482, delay: 33},
                {clientX: 387, clientY: 460, delay: 33},
                {clientX: 379, clientY: 431, delay: 33},
                {clientX: 377, clientY: 385, delay: 38},
                {clientX: 391, clientY: 343, delay: 33},
                {clientX: 405, clientY: 321, delay: 32},
                {clientX: 422, clientY: 306, delay: 33},
                {clientX: 444, clientY: 297, delay: 31},
                {clientX: 468, clientY: 288, delay: 34},
                {clientX: 514, clientY: 266, delay: 32},
                {clientX: 554, clientY: 244, delay: 32},
                {clientX: 592, clientY: 227, delay: 34},
                {clientX: 649, clientY: 205, delay: 29},
                {clientX: 723, clientY: 172, delay: 42},
                {clientX: 765, clientY: 152, delay: 29},
                {clientX: 797, clientY: 133, delay: 32},
                {clientX: 808, clientY: 123, delay: 33},
                {clientX: 810, clientY: 118, delay: 32},
                {clientX: 805, clientY: 115, delay: 31},
                {clientX: 786, clientY: 109, delay: 33},
                {clientX: 736, clientY: 106, delay: 32},
                {clientX: 672, clientY: 106, delay: 32},
                {clientX: 602, clientY: 108, delay: 34},
                {clientX: 543, clientY: 115, delay: 33},
                {clientX: 488, clientY: 126, delay: 32},
                {clientX: 444, clientY: 140, delay: 28},
                {clientX: 390, clientY: 155, delay: 51},
                {clientX: 358, clientY: 164, delay: 30},
                {clientX: 322, clientY: 178, delay: 42},
                {clientX: 302, clientY: 189, delay: 31},
                {clientX: 279, clientY: 207, delay: 36},
                {clientX: 261, clientY: 227, delay: 35},
                {clientX: 244, clientY: 248, delay: 28},
                {clientX: 229, clientY: 266, delay: 27},
                {clientX: 220, clientY: 279, delay: 32},
                {clientX: 214, clientY: 294, delay: 31},
                {clientX: 212, clientY: 307, delay: 32},
                {clientX: 212, clientY: 327, delay: 43},
                {clientX: 213, clientY: 339, delay: 32},
                {clientX: 219, clientY: 351, delay: 35},
                {clientX: 225, clientY: 360, delay: 25},
                {clientX: 234, clientY: 369, delay: 31},
                {clientX: 249, clientY: 382, delay: 48},
                {clientX: 262, clientY: 391, delay: 32},
                {clientX: 279, clientY: 401, delay: 34},
                {clientX: 303, clientY: 407, delay: 32},
                {clientX: 343, clientY: 411, delay: 32},
                {clientX: 393, clientY: 415, delay: 40},
                {clientX: 447, clientY: 418, delay: 43},
                {clientX: 482, clientY: 430, delay: 29},
                {clientX: 499, clientY: 443, delay: 34},
                {clientX: 507, clientY: 463, delay: 32},
                {clientX: 508, clientY: 500, delay: 35},
                {clientX: 502, clientY: 538, delay: 30},
                {clientX: 497, clientY: 571, delay: 36},
                {clientX: 494, clientY: 595, delay: 26},
                {clientX: 490, clientY: 613, delay: 32},
                {clientX: 481, clientY: 629, delay: 33},
                {clientX: 464, clientY: 648, delay: 32},
                {clientX: 445, clientY: 668, delay: 33},
                {clientX: 424, clientY: 689, delay: 32},
                {clientX: 410, clientY: 703, delay: 32},
                {clientX: 407, clientY: 707, delay: 31},
                {clientX: 420, clientY: 707, delay: 72},
                {clientX: 452, clientY: 706, delay: 32},
                {clientX: 521, clientY: 667, delay: 54},
                {clientX: 551, clientY: 633, delay: 26},
                {clientX: 567, clientY: 591, delay: 39},
                {clientX: 575, clientY: 545, delay: 26},
                {clientX: 578, clientY: 514, delay: 32},
                {clientX: 579, clientY: 478, delay: 40},
                {clientX: 579, clientY: 462, delay: 33},
                {clientX: 577, clientY: 454, delay: 32},
                {clientX: 575, clientY: 452, delay: 39},
                {clientX: 574, clientY: 450, delay: 71},
                {clientX: 574, clientY: 444, delay: 33},
                {clientX: 578, clientY: 427, delay: 32},
                {clientX: 589, clientY: 402, delay: 32},
                {clientX: 616, clientY: 352, delay: 53},
                {clientX: 629, clientY: 331, delay: 29},
                {clientX: 641, clientY: 317, delay: 26},
                {clientX: 651, clientY: 310, delay: 170},
                {clientX: 686, clientY: 310, delay: 32},
                {clientX: 755, clientY: 310, delay: 32},
                {clientX: 857, clientY: 310, delay: 28},
            ],
          
            ],

            startAnim : function() {
                const gl = themeToolkit.glitchGL;
                let i = 0;
                const dispSizeCoef = {
                    x: window.innerWidth / 1200,
                    y: window.innerHeight / 800,
                };

                gl.anim.animNumber = Math.floor(Math.random() * gl.cords.length);

                gl.follow.x = gl.cords[gl.anim.animNumber][i].clientX * dispSizeCoef.x;
                gl.follow.y = gl.cords[gl.anim.animNumber][i].clientY * dispSizeCoef.y;
                gl.follow.vx = 0;
                gl.follow.vy = 0;
                gl.anim.animInterval = setInterval(() => {
                    const ev = {
                        clientX: gl.cords[gl.anim.animNumber][i].clientX * dispSizeCoef.x,
                        clientY: gl.cords[gl.anim.animNumber][i].clientY * dispSizeCoef.y
                    };

                    gl.onMouseMove(ev);
                    if (!gl.cords[gl.anim.animNumber][++i]) {
                        clearInterval(gl.anim.animInterval);
                        gl.anim.animTimeout = setTimeout(gl.startAnim,2000);
                    }
                }, gl.cords[gl.anim.animNumber][i+1].delay);
            },

            kill : function() {
                const gl = themeToolkit.glitchGL;

                if ( gl.renderer !== null ) {
                    window.removeEventListener("mousemove", gl.mouseMove, true);
                    window.removeEventListener("resize", gl.onWindowResize,false);
                    gl.cancelLoop();
                    gl.scene.remove( gl.mesh );
                    gl.renderer.dispose();
                    gl.texture.dispose();
                    gl.scene.dispose();
                }

            }

        },

    }

}(jQuery));