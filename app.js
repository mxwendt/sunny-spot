var context = Argon.immersiveContext;
var options = THREE.Bootstrap.createArgonOptions( context );
var three = THREE.Bootstrap( options );

/**
  Buzz above the Turning Torso
*/

var buzz = new THREE.Object3D;
var loader = new THREE.TextureLoader();
loader.load( 'buzz.png', function ( texture ) {
  var geometry = new THREE.BoxGeometry(10, 10, 10);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh( geometry, material );
  mesh.scale.set(10, 10, 10);
  buzz.add( mesh );
});

var turningTorsoGeo = new Argon.Cesium.Entity({
  name: "Turning Torso",
  position: Argon.Cesium.Cartesian3.fromDegrees(55.6133068, 12.9741071, 300)
});

var turningTorsoGeoTarget = three.argon.objectFromEntity(turningTorsoGeo);
turningTorsoGeoTarget.add(buzz);

/**
 The wooden box in front of me
*/

var boxGeoObject = new THREE.Object3D;
var box = new THREE.Object3D;
var loader = new THREE.TextureLoader();
loader.load( 'box.png', function ( texture ) {
 var geometry = new THREE.BoxGeometry(1, 1, 1);
 var material = new THREE.MeshBasicMaterial( { map: texture } );
 var mesh = new THREE.Mesh( geometry, material );
 box.add( mesh );
});

boxGeoObject.add(box);
three.scene.add(boxGeoObject );

var boxGeoEntity = three.argon.entityFromObject(boxGeoObject);

var realityInit = false;
var boxPos= [0, 0, 0];
three.on("argon:realityChange", function(event) {
  realityInit = true;
  // set the position to be near the camera
  var cameraPosition = three.camera.getWorldPosition();
  cameraPosition.x += 5;
  boxGeoObject.position.copy(cameraPosition);
  three.argon.updateEntityFromObject(boxGeoObject);
  // getCartographicDegreesFromObject will return undefined if geoObject is not defined in geographic coordinates  which would happen if this Reality does not support geographic coordinates
  geoObjectPos = three.argon.getCartographicDegreesFromObject(boxGeoObject) || [0,0,0];
});

var lastInfoText;

three.on('update', function(event) {
  var elem = document.getElementById('location');
  var state = event.argonState;

  // Ignore updates until we have a reality
  if (! realityInit) {
    elem.innerText = "No Reality Yet";
    return;
  }

  // Get the position of the device
  var gpsPos = [0, 0, 0];
  if (state.position.cartographicDegrees) {
    gpsPos = state.position.cartographicDegrees;
  }

  // Rotate both boxes for some visual sugar
  buzz.rotation.y += 2 * three.Time.delta;
  box.rotation.y += 3 * three.Time.delta;

  // Compute distance from the camera to each of the two cubes
  var point1 = three.camera.getWorldPosition();
  var point2 = buzz.getWorldPosition();
  var point3 = box.getWorldPosition();
  var distance = point1.distanceTo( point2 );
  var distance2 = point1.distanceTo( point3 );

  // Output some information
  var infoText = "Geospatial Argon3 example:\n"
  infoText += "eye (" + toFixed(gpsPos[0],6) + ", ";
  infoText += toFixed(gpsPos[1], 6) + ", " + toFixed(gpsPos[2], 2) + ")\n";
  infoText += "cube(" + toFixed(boxPos[0], 6) + ", ";
  infoText += toFixed(boxPos[1], 6) + ", " + toFixed(boxPos[1],2) + ")\n";
  infoText += "distance to GT (" + toFixed(distance,2) + ")";
  infoText += " distance to box (" + toFixed(distance2,2) + ")";

  if (lastInfoText !== infoText) {
    elem.innerText = infoText;
    lastInfoText = infoText;
  }
});
