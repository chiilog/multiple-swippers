document
	.querySelectorAll( '.carousel-target-class' )
	.forEach( ( target ) => {
		new Carousel(
			target,
			{
				autoplay: {
					delay: 5000,
				},
				pagination: {
					el: target.querySelector( '.swiper-pagination' ),
					type: 'bullets',
					clickable: true,
				},
				navigation: {
					nextBtn: target.querySelector(
						'.carousel-target-class__next'
					),
					previousBtn: target.querySelector(
						'.carousel-target-class__prev'
					),
					playBtn: target.querySelector(
						'.carousel-target-class__play'
					),
					pauseBtn: target.querySelector(
						'.carousel-target-class__pause'
					),
				},
				centeredSlides: true,
				slidesPerView: 3,
				slidesPerGroup: 1,
				spaceBetween: 40,
				speed: 900,
				loop: true,
			},
			{ width: 768, checkByMaxValue: false }
		);
	} );
