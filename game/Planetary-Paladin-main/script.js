// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(
  75,
  aspect,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ canvas: gameCanvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Position the camera
camera.position.set(0, 0, 10);
camera.lookAt(scene.position);

// Add the camera to the scene
scene.add(camera);

// Create a player character
const playerGeometry = new THREE.PlaneGeometry(1, 2);
const playerTexture = new THREE.TextureLoader().load("images/player.png");
const playerMaterial = new THREE.MeshBasicMaterial({
  map: playerTexture,
  transparent: true
});
const player = new THREE.Mesh(playerGeometry, playerMaterial);

// Add the player character to the scene
scene.add(player);

// Add the player character to the scene
scene.add(player);

// Set up key event listeners
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// Set up key state object
const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false
};

// Set up laser array
const lasers = [];

// Create laser objects
for (let i = 0; i < 10; i++) {
  const laserGeometry = new THREE.BoxGeometry(0.1, 0.1, 5);
  const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const laser = new THREE.Mesh(laserGeometry, laserMaterial);
  laser.visible = false;
  scene.add(laser);
  lasers.push(laser);
}

// Handle keydown events
function onKeyDown(event) {
  switch (event.code) {
    case "ArrowLeft":
      keys.left = true;
      break;
    case "ArrowRight":
      keys.right = true;
      break;
    case "ArrowUp":
      keys.up = true;
      break;
    case "ArrowDown":
      keys.down = true;
      break;
    case "Space":
      fireLaser();
      break;
    }
  event.preventDefault();
}

// Handle keyup events
function onKeyUp(event) {
  switch (event.code) {
    case "ArrowLeft":
      keys.left = false;
      break;
    case "ArrowRight":
      keys.right = false;
      break;
    case "ArrowUp":
      keys.up = false;
      break;
    case "ArrowDown":
      keys.down = false;
      break;
    case "ArrowDown":
      keys.space = false;
      break;
    }
}

// Fire a laser
function fireLaser() {
    for (const laser of lasers) {
      if (!laser.visible) {
        laser.position.copy(player.position);
        laser.visible = true;
        laserSound.pause();
        laserSound.currentTime = 0;
        laserSound.play();
        break;
      }
    }
  }

// Update player position based on key state
function updatePlayerPosition() {
  if (keys.left) {
    player.position.x -= 0.1;
  }
  if (keys.right) {
    player.position.x += 0.1;
  }
  if (keys.up) {
    player.position.y += 0.1;
  }
  if (keys.down) {
    player.position.y -= 0.1;
  }

  if (keys.space && !laser.visible) {
    laser.position.copy(player.position);
    laser.visible = true;
  }
}

// Update laser positions
function updateLaserPositions() {
  for (const laser of lasers) {
    if (laser.visible) {
      laser.position.z -= 0.5;
      if (laser.position.z < -50) {
        laser.visible = false;
      }
    }
  }
}

// Set up enemy array
const enemies = [];

// Create enemy objects
for (let i = 0; i < 10; i++) {
  const enemyGeometry = new THREE.PlaneGeometry(1, 2);
  const enemyTexture = new THREE.TextureLoader().load("images/enemy.png");
  const enemyMaterial = new THREE.MeshBasicMaterial({
    map: enemyTexture,
    transparent: true
  });
  const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
  enemy.position.set(
    1,
    Math.random() * 20 - 10,
    Math.random() * 20 - 10
  );
  enemy.speed = Math.random() * 0.1 + 0.1;
  scene.add(enemy);
  enemies.push(enemy);
}

// Update enemy positions
function updateEnemyPositions() {
  for (const enemy of enemies) {
    enemy.position.y += Math.sin(enemy.position.z / 10) * 0.1;
    enemy.position.z += enemy.speed;
    if (enemy.position.z > 50) {
      enemy.position.z = -10;
      enemy.position.y = Math.random() * 20 - 10;
    }
    // Make the enemies fire lasers at random intervals if they are in front of the player
    if (Math.random() < 0.005 && enemy.position.z < player.position.z) {
      fireEnemyLaser(enemy);
    }
  }
}


// Update enemy laser positions
function updateEnemyLaserPositions() {
  for (const enemyLaser of enemyLasers) {
    if (enemyLaser.visible) {
      // Move the enemy laser in its specified direction
      enemyLaser.position.add(enemyLaser.direction.clone().multiplyScalar(0.25));
      if (enemyLaser.position.z > 50) {
        enemyLaser.visible = false;
      }
    }
  }
}

// Check for collisions between player and enemy lasers
function checkPlayerCollisions() {
  const playerBox = new THREE.Box3().setFromObject(player);
  for (const enemyLaser of enemyLasers) {
    if (enemyLaser.visible) {
      const laserBox = new THREE.Box3().setFromObject(enemyLaser);
      if (playerBox.intersectsBox(laserBox)) {
        // Player was hit by an enemy laser
        enemyLaser.visible = false;

        // Flash the screen red and fade out the red color
        score -= 200;
        updateScore();
        // Start the red flash effect
        redFlashTime = 1;

        playerHitSound.pause();
        playerHitSound.currentTime = 0;
        playerHitSound.play();

        break;
      }
    }
  }
}

// Set up red flash effect
let redFlashTime = 0;

// Create a red mesh to cover the screen
const redGeometry = new THREE.PlaneGeometry(20, 20);
const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
const redMesh = new THREE.Mesh(redGeometry, redMaterial);
redMesh.position.z = 5;
scene.add(redMesh);


// Set up explosion array
const explosions = [];

// Create explosion objects
for (let i = 0; i < 10; i++) {
  const explosionGeometry = new THREE.SphereGeometry(1, 32, 32);
  const explosionMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 1, transparent: true });
  const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
  explosion.visible = false;
  scene.add(explosion);
  explosions.push(explosion);
}

let score = 0;
let scoreFont;
let scoreGeometry;
let scoreMesh;
const scoreFontObj = new THREE.FontLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', fnt => {
    scoreFont = fnt;

    // Set up score
    const scoreText = `Score: ${score}`;
    scoreGeometry = new THREE.TextGeometry(scoreText, {
        font: scoreFont,
        size: 1,
        height: 0.1
    });
    const scoreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    scoreMesh = new THREE.Mesh(scoreGeometry, scoreMaterial);
    scoreMesh.position.set(-10, 12, -9);
    scene.add(scoreMesh);
});

// Update score
function updateScore() {
  score += 100;
  // Change the color of the score text to a random color.
  scoreMesh.material.color.setHex(Math.random() * 0xffffff);
  const scoreText = `Score: ${score}`;
  scoreGeometry.dispose();
  scoreGeometry = new THREE.TextGeometry(scoreText, {
    font: scoreFont,
    size: 1,
    height: 0.1
  });
  scoreMesh.geometry = scoreGeometry;
}

// Check for collisions between lasers and enemies
function checkCollisions() {
  const laserBox = new THREE.Box3();
  const enemyBox = new THREE.Box3();
  for (const laser of lasers) {
    if (laser.visible) {
      laserBox.setFromObject(laser);
      for (const enemy of enemies) {
        enemyBox.setFromObject(enemy);
        if (laserBox.intersectsBox(enemyBox)) {
          laser.visible = false;
          showExplosion(enemy.position);
          enemy.position.z = -10;
          enemy.position.y = Math.random() * 20 - 10;
          explosionSound.pause();
          explosionSound.currentTime = 0;
          explosionSound.play();
          updateScore();
          break;
        }
      }
    }
  }
}

// Set up enemy laser array
const enemyLasers = [];

// Create enemy laser objects
for (let i = 0; i < 10; i++) {
  const enemyLaserGeometry = new THREE.BoxGeometry(0.1, 0.1, 5);
  const enemyLaserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const enemyLaser = new THREE.Mesh(enemyLaserGeometry, enemyLaserMaterial);
  enemyLaser.visible = false;
  scene.add(enemyLaser);
  enemyLasers.push(enemyLaser);
}

// Fire an enemy laser
function fireEnemyLaser(enemy) {
  for (const enemyLaser of enemyLasers) {
    if (!enemyLaser.visible) {
      enemyLaser.position.copy(enemy.position);
      // Set the direction of the enemy laser based on the position of the player
      enemyLaser.direction = new THREE.Vector3().subVectors(player.position, enemy.position).normalize();
      enemyLaser.visible = true;

      enemyLaserSound.pause();
      enemyLaserSound.currentTime = 0;
      enemyLaserSound.play();

      break;
    }
  }
}

// Create a particle system
const particleCount = 100;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

// Create individual particles
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = Math.random() * 2 - 1;
    positions[i3 + 1] = Math.random() * 2 - 1;
    positions[i3 + 2] = Math.random() * 2 - 1;
}
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1
});
const particleSystem = new THREE.Points(particles, particleMaterial);
particleSystem.visible = false;
scene.add(particleSystem);

// Show an explosion at the specified position
function showExplosion(position) {
  for (const explosion of explosions) {
    if (!explosion.visible) {
      explosion.position.copy(position);
      explosion.scale.set(0.01, 0.01, 0.01);
      explosion.material.opacity = 1;
      explosion.visible = true;
      particleSystem.position.copy(position);
      particleSystem.scale.z = 0;
      particleSystem.visible = true;
      break;
    }
  }
}

// Update explosion and particle positions and sizes
function updateExplosions() {
  for (const explosion of explosions) {
    if (explosion.visible) {
      explosion.scale.x += 0.1;
      explosion.scale.y += 0.1;
      explosion.scale.z += 0.1;
      explosion.material.opacity -= 0.025;
      particleSystem.scale.z -= 0.2;
      if (explosion.material.opacity <= 0) {
        explosion.visible = false;
        particleSystem.visible = false;
      }
    }
  }
}

// Set up star array
const stars = [];

// Create star objects
for (let i = 0; i < 100; i++) {
  const starGeometry = new THREE.SphereGeometry(0.05, 1, 2);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.set(
    Math.random() * 20 - 10,
    Math.random() * 20 - 10,
    Math.random() * -20
  );
  scene.add(star);
  stars.push(star);
}

// Update star positions
function updateStarPositions() {
  for (const star of stars) {
    star.position.z += 0.1;
    if (star.position.z > 10) {
      star.position.z = -20;
      star.position.x = Math.random() * 20 - 10;
      star.position.y = Math.random() * 20 - 10;
    }
  }
}

// Create a laser sound effect
const laserSound = new Audio("images/laser.mp3");

// Create an explosion sound effect
const explosionSound = new Audio("images/explode.mp3");
const enemyLaserSound = new Audio("images/enemyLaser.mp3");
const playerHitSound = new Audio("images/playerHit.mp3");

// Update player, enemy, laser, explosion, and star positions in render loop
function render() {
  requestAnimationFrame(render);
  updatePlayerPosition();
  updateEnemyPositions();
  updateEnemyLaserPositions();
  updateLaserPositions();
  checkCollisions();
  checkPlayerCollisions();
  updateExplosions();
  updateStarPositions();

  // Update red flash effect
  if (redFlashTime > 0) {
    redFlashTime -= 0.1;
    redMaterial.opacity = redFlashTime;
  }

  renderer.render(scene, camera);
}
render();
