/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import {
	Euler,
	EventDispatcher,
	Vector3
} from "three";

var PointerLockControls = function ( camera, domElement ) {

	this.domElement = domElement || document.body;
	this.isLocked = false;

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	function onMouseMove( event ) {

		// if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		camera.quaternion.setFromEuler( euler );

		scope.dispatchEvent( changeEvent );

	}

	function onDocumentTouchStart( event ) {

		// if ( scope.isLocked === false ) return;
		event.preventDefault(); 
	}

	function onDocumentTouchEnd( event ) {

		// if ( scope.isLocked === false ) return;
		event.preventDefault(); 
	}

	function onDocumentTouchMove( event ) {

		// if ( scope.isLocked === false ) return;
		event.preventDefault(); 
		var movementX = (event.targetTouches[ 0 ].pageX /  window.innerWidth) * 2 -1;

		var movementY = -(event.targetTouches[ 0 ].pageY / window.innerHeight) *2 +1;


		// console.log(`x: ${movementX}, y: ${movementY}`)
		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX* 0.02;
		euler.x -= movementY* 0.02;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		// console.log(euler)
		camera.quaternion.setFromEuler( euler );

		scope.dispatchEvent( changeEvent );

	}

	function onPointerlockChange() {

		if ( this.domElement.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( lockEvent );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( unlockEvent );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	this.connect = function () {

		this.domElement.addEventListener( 'mousemove', onMouseMove, false );
		this.domElement.addEventListener( 'touchmove', onDocumentTouchMove, { passive: false } );
		this.domElement.addEventListener( 'touchstart', onDocumentTouchStart, { passive: false } );
		this.domElement.addEventListener( 'touchend', onDocumentTouchEnd, { passive: false } );
		this.domElement.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		this.domElement.addEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.disconnect = function () {

		this.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		this.domElement.removeEventListener( 'touchmove', onDocumentTouchMove, { passive: false } );
		this.domElement.removeEventListener( 'touchstart', onDocumentTouchStart, { passive: false } );
		this.domElement.removeEventListener( 'touchend', onDocumentTouchEnd, { passive: false } );
		this.domElement.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		this.domElement.removeEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		this.domElement.exitPointerLock();

	};

	this.connect();

};

PointerLockControls.prototype = Object.create( EventDispatcher.prototype );
PointerLockControls.prototype.constructor = PointerLockControls;

export { PointerLockControls };
