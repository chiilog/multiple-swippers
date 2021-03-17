import { throttle } from 'lodash';
import Swiper, { Navigation, Pagination, Autoplay } from 'swiper';
Swiper.use( [ Navigation, Pagination, Autoplay ] );

const IS_PLAY = 'is-play';
const IS_PAUSE = 'is-pause';

/**
 * カルーセルを生成するクラス
 * NOTE: カルーセルアイテムのPrev/Nextの挙動はSwiper側に依存しているため記述なし
 */
class Carousel {
	/**
	 * @typedef MediaQuery
	 * @type {Object}
	 * @property {number} width - ウィンドウ幅
	 * @property {boolean} checkByMaxValue - trueのときはスマホでスライダーが動く
	 */

	/**
	 * カルーセルを動作させるクラス名とオプションを指定する
	 *
	 * @param {Element} element
	 * @param {Object} options
	 * @param {MediaQuery|null} mediaQuery
	 */
	constructor( element, options, mediaQuery ) {
		this.element = element;
		this.options = options;
		this.mediaQuery = mediaQuery;

		this.switchSliderView();
		this.registerResizeAction();
	}

	/**
	 * 自動再生が有効かどうか
	 *
	 * @return {boolean} - trueの場合、自動再生が有効になっている
	 */
	isAutoPlay() {
		return !! this.options.autoplay;
	}

	/**
	 * カルーセルを再生する
	 */
	play() {
		if ( this.swiper ) {
			this.swiper.autoplay.start();
			this.addStatusClassToContainer( true );
		}
	}

	/**
	 * カルーセルを一時停止する
	 */
	pause() {
		if ( this.swiper ) {
			this.swiper.autoplay.stop();
			this.addStatusClassToContainer( false );
		}
	}

	/**
	 * コンテナに自動再生中・一時停止中のクラスをつける
	 *
	 * @param {boolean} status
	 */
	addStatusClassToContainer( status ) {
		this.swiper.el.classList.add( status ? IS_PLAY : IS_PAUSE );
		this.swiper.el.classList.remove( status ? IS_PAUSE : IS_PLAY );
	}

	/**
	 * リサイズ時の挙動を登録
	 */
	registerResizeAction() {
		globalThis.addEventListener(
			'resize',
			throttle( () => {
				this.switchSliderView();
			}, 1000 )
		);
	}

	/**
	 * Swiperが破棄されているかどうかをチェックする
	 *
	 * @return {boolean} - trueの場合、Swiperが破棄されている
	 */
	isSwiperDestroyed() {
		/**
		 * NOTE: 対偶（! (A && B) = ! A || ! B）でとれる
		 * ! this.swiper || this.swiper.destroyed の反対は this.swiper && ! this.swiper.destroyed
		 **/
		return ! this.swiper || this.swiper.destroyed;
	}

	/**
	 * カルーセルじゃなくする
	 */
	changeToNoSliderView() {
		if ( ! this.isSwiperDestroyed() ) {
			this.swiper.destroy();
		}
	}

	/**
	 * カルーセルにする
	 */
	changeToSliderView() {
		if ( this.isSwiperDestroyed() ) {
			this.initializeSwiper();
		}
	}

	/**
	 * カルーセルの初期化
	 */
	initializeSwiper() {
		this.swiper = new Swiper( this.element, this.options );
		this.registerController();
		this.addStatusClassToContainer( this.isAutoPlay() );
	}

	/**
	 * カルーセルするかどうか
	 */
	switchSliderView() {
		if ( this.isActivateSliderView() ) {
			this.changeToSliderView();
		} else {
			this.changeToNoSliderView();
		}
	}

	/**
	 * スライダーが有効になっているかどうかを判定する
	 *
	 * @return {boolean} - trueの場合、スライダーが有効になっている
	 */
	isActivateSliderView() {
		if ( ! this.mediaQuery ) {
			return true;
		}

		const query = this.mediaQuery.checkByMaxValue
			? 'max-width'
			: 'min-width';

		return window.matchMedia( `(${ query }: ${ this.mediaQuery.width }px)` )
			.matches;
	}

	/**
	 * Swiperを操作するコントローラーの登録
	 */
	registerController() {
		this.registerPlayHandle();
		this.registerPauseHandle();
		this.registerPrevHandle();
		this.registerNextHandle();
		this.registerPaginationHandle();
		this.registerTouchMoveHandle();
	}

	/**
	 * スライダーをタップ・クリックして動かしたときの動作を登録
	 */
	registerTouchMoveHandle() {
		if ( ! this.isSwiperDestroyed() ) {
			this.swiper.on( 'sliderMove', () => {
				this.addStatusClassToContainer( false );
			} );
		}
	}

	/**
	 * ページネーションをクリックしたときの動作を登録
	 *
	 * NOTE: ユーザー動作で状態を変更するイベントがなかったため実装
	 */
	registerPaginationHandle() {
		if ( this.swiper?.pagination?.bullets ) {
			/* eslint-disable jsdoc/valid-types */
			/**
			 * @type { import(“dom7”).Dom7Array } bullets
			 */
			/* eslint-enable jsdoc/valid-types */
			const bullets = this.swiper.pagination.bullets;

			bullets.forEach( ( bullet ) => {
				bullet.addEventListener( 'click', () => {
					this.addStatusClassToContainer( false );
				} );
			} );
		}
	}

	/**
	 * 前のスライダーへの移動ボタンをクリックしたときの動作を登録
	 */
	registerPrevHandle() {
		if ( this.options?.navigation?.previousBtn ) {
			this.options.navigation.previousBtn.addEventListener(
				'click',
				() => {
					this.pause();
					this.swiper.slidePrev();
				}
			);
		}
	}

	/**
	 * 次のスライダーへの移動ボタンをクリックしたときの動作を登録
	 */
	registerNextHandle() {
		if ( this.options?.navigation?.nextBtn ) {
			this.options.navigation.nextBtn.addEventListener( 'click', () => {
				this.pause();
				this.swiper.slideNext();
			} );
		}
	}

	/**
	 * 再生ボタンをクリックしたときの動作を登録
	 */
	registerPlayHandle() {
		if ( this.options?.navigation?.playBtn ) {
			this.options.navigation.playBtn.addEventListener( 'click', () => {
				this.play();
			} );
		}
	}

	/**
	 * 一時停止ボタンをクリックしたときの動作を登録
	 */
	registerPauseHandle() {
		if ( this.options?.navigation?.pauseBtn ) {
			this.options.navigation.pauseBtn.addEventListener( 'click', () => {
				this.pause();
			} );
		}
	}
}
export default Carousel;
