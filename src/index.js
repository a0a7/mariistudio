import * as THREE from 'three';

const counterDOM = document.getElementById('counter');
const endDOM = document.getElementById('end');

const scene = new THREE.Scene();

const distance = 500;
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    0.1,
    10000
);

camera.rotation.x = 50 * Math.PI / 180;
camera.rotation.y = 20 * Math.PI / 180;
camera.rotation.z = 10 * Math.PI / 180;

const initialCameraPositionY = -Math.tan(camera.rotation.x) * distance;
const initialCameraPositionX = Math.tan(camera.rotation.y) * Math.sqrt(distance ** 2 + initialCameraPositionY ** 2);
camera.position.y = initialCameraPositionY;
camera.position.x = initialCameraPositionX;
camera.position.z = distance;

const zoom = 2;
const gooseSize = 15;
const positionWidth = 42;
const columns = 17;
const boardWidth = positionWidth * columns;
const stepTime = 200;

const maxScore = 22;

let lanes;
let currentLane;
let currentColumn;
let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;

const carFrontTexture = new Texture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = new Texture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = new Texture(110, 40, [{ x: 10, y: 0, w: 50, h: 30 }, { x: 70, y: 0, w: 30, h: 30 }]);
const carLeftSideTexture = new Texture(110, 40, [{ x: 10, y: 10, w: 50, h: 30 }, { x: 70, y: 10, w: 30, h: 30 }]);

const truckFrontTexture = new Texture(30, 30, [{ x: 15, y: 0, w: 10, h: 30 }]);
const truckRightSideTexture = new Texture(25, 30, [{ x: 0, y: 15, w: 10, h: 10 }]);
const truckLeftSideTexture = new Texture(25, 30, [{ x: 0, y: 5, w: 10, h: 10 }]);

const laneTypes = ['car', 'truck', 'forest', 'river'];
const laneSpeeds = [2, 2.5, 3];
const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const treeHeights = [20, 45, 60];

let isOnLog = false;
let currentLogSpeed = 0;

function Texture(width, height, rects) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(0,0,0,0.6)";
    rects.forEach(rect => {
        context.fillRect(rect.x, rect.y, rect.w, rect.h);
    });
    return new THREE.CanvasTexture(canvas);
}

function Wheel() {
    const wheel = new THREE.Mesh(
        new THREE.BoxGeometry(12 * zoom, 33 * zoom, 12 * zoom),
        new THREE.MeshLambertMaterial({ color: 0x333333, flatShading: true })
    );
    wheel.position.z = 6 * zoom;
    return wheel;
}

function Car() {
    const car = new THREE.Group();
    const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

    const main = new THREE.Mesh(
        new THREE.BoxGeometry(60 * zoom, 30 * zoom, 15 * zoom),
        new THREE.MeshPhongMaterial({ color, flatShading: true })
    );
    main.position.z = 12 * zoom;
    main.castShadow = true;
    main.receiveShadow = true;
    car.add(main);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(33 * zoom, 24 * zoom, 12 * zoom),
        [
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carBackTexture }),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carFrontTexture }),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carRightSideTexture }),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carLeftSideTexture }),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true })
        ]
    );
    cabin.position.x = 6 * zoom;
    cabin.position.z = 25.5 * zoom;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    car.add(cabin);

    const frontWheel = new Wheel();
    frontWheel.position.x = -18 * zoom;
    car.add(frontWheel);

    const backWheel = new Wheel();
    backWheel.position.x = 18 * zoom;
    car.add(backWheel);

    car.castShadow = true;
    car.receiveShadow = false;

    return car;
}

function Truck() {
    const truck = new THREE.Group();
    const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(100 * zoom, 25 * zoom, 5 * zoom),
        new THREE.MeshLambertMaterial({ color: 0xb4c6fc, flatShading: true })
    );
    base.position.z = 10 * zoom;
    truck.add(base);

    const cargo = new THREE.Mesh(
        new THREE.BoxGeometry(75 * zoom, 35 * zoom, 40 * zoom),
        new THREE.MeshPhongMaterial({ color: 0xb4c6fc, flatShading: true })
    );
    cargo.position.x = 15 * zoom;
    cargo.position.z = 30 * zoom;
    cargo.castShadow = true;
    cargo.receiveShadow = true;
    truck.add(cargo);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(25 * zoom, 30 * zoom, 30 * zoom),
        [
            new THREE.MeshPhongMaterial({ color, flatShading: true }),
            new THREE.MeshPhongMaterial({ color, flatShading: true, map: truckFrontTexture }),
            new THREE.MeshPhongMaterial({ color, flatShading: true, map: truckRightSideTexture }),
            new THREE.MeshPhongMaterial({ color, flatShading: true, map: truckLeftSideTexture }),
            new THREE.MeshPhongMaterial({ color, flatShading: true }),
            new THREE.MeshPhongMaterial({ color, flatShading: true })
        ]
    );
    cabin.position.x = -40 * zoom;
    cabin.position.z = 20 * zoom;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    truck.add(cabin);

    const frontWheel = new Wheel();
    frontWheel.position.x = -38 * zoom;
    truck.add(frontWheel);

    const middleWheel = new Wheel();
    middleWheel.position.x = -10 * zoom;
    truck.add(middleWheel);

    const backWheel = new Wheel();
    backWheel.position.x = 30 * zoom;
    truck.add(backWheel);

    return truck;
}

function Tree() {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(15 * zoom, 15 * zoom, 20 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x4d2926, flatShading: true })
    );
    trunk.position.z = 10 * zoom;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const height = treeHeights[Math.floor(Math.random() * treeHeights.length)];

    const crown = new THREE.Mesh(
        new THREE.BoxGeometry(30 * zoom, 30 * zoom, height * zoom),
        new THREE.MeshLambertMaterial({ color: 0x7aa21d, flatShading: true })
    );
    crown.position.z = (height / 2 + 20) * zoom;
    crown.castShadow = true;
    crown.receiveShadow = false;
    tree.add(crown);

    return tree;
}

function Log() {
    const log = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(80 * zoom, 30 * zoom, 12 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x8B4513, flatShading: true })
    );
    body.position.z = 6 * zoom;
    body.castShadow = true;
    body.receiveShadow = true;
    log.add(body);

    // Add some texture details to the log
    const ring1 = new THREE.Mesh(
        new THREE.BoxGeometry(2 * zoom, 32 * zoom, 14 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x654321, flatShading: true })
    );
    ring1.position.set(-20 * zoom, 0, 6 * zoom);
    log.add(ring1);

    const ring2 = new THREE.Mesh(
        new THREE.BoxGeometry(2 * zoom, 32 * zoom, 14 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x654321, flatShading: true })
    );
    ring2.position.set(20 * zoom, 0, 6 * zoom);
    log.add(ring2);

    return log;
}

function Chicken() {
    const kiwi = new THREE.Group();

    // Kiwi fruit body (brown fuzzy exterior)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(gooseSize * zoom, gooseSize * zoom, 20 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x8B6F47, flatShading: true })
    );
    body.position.z = 10 * zoom;
    body.castShadow = true;
    body.receiveShadow = true;
    kiwi.add(body);

    // Green flesh slice on front (to show it's a kiwi)
    const slice = new THREE.Mesh(
        new THREE.BoxGeometry(gooseSize * zoom * 0.9, gooseSize * zoom * 0.9, 1 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x9ACD32, flatShading: true })
    );
    slice.position.set(0, 0, 20.5 * zoom);
    slice.castShadow = true;
    kiwi.add(slice);

    // White center
    const center = new THREE.Mesh(
        new THREE.BoxGeometry(3 * zoom, 3 * zoom, 1.5 * zoom),
        new THREE.MeshPhongMaterial({ color: 0xF5F5DC, flatShading: true })
    );
    center.position.set(0, 0, 21 * zoom);
    kiwi.add(center);

    // Black seeds (arranged in a circle around the center)
    const seedGeometry = new THREE.BoxGeometry(1 * zoom, 1 * zoom, 1 * zoom);
    const seedMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, flatShading: true });
    
    const seedPositions = [
        [3, 0], [-3, 0], [0, 3], [0, -3],
        [2, 2], [-2, 2], [2, -2], [-2, -2]
    ];
    
    seedPositions.forEach(([x, y]) => {
        const seed = new THREE.Mesh(seedGeometry, seedMaterial);
        seed.position.set(x * zoom, y * zoom, 21.5 * zoom);
        kiwi.add(seed);
    });

    // Fuzzy texture bumps on the brown exterior
    const fuzzyBumps = [
        [-0.4, 0.2, 12], [0.4, 0.2, 12],
        [-0.3, -0.2, 14], [0.3, -0.2, 14],
        [0, 0.4, 16], [-0.4, 0, 18], [0.4, 0, 18]
    ];
    
    fuzzyBumps.forEach(([x, y, z]) => {
        const bump = new THREE.Mesh(
            new THREE.BoxGeometry(2 * zoom, 2 * zoom, 2 * zoom),
            new THREE.MeshPhongMaterial({ color: 0x6B5030, flatShading: true })
        );
        bump.position.set(x * gooseSize * zoom, y * gooseSize * zoom, z * zoom);
        kiwi.add(bump);
    });

    // Little feet to make it cute (small brown stubs)
    const footGeometry = new THREE.BoxGeometry(4 * zoom, 4 * zoom, 3 * zoom);
    const footMaterial = new THREE.MeshPhongMaterial({ color: 0x8B6F47, flatShading: true });
    
    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-5 * zoom, 0, 2 * zoom);
    kiwi.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(5 * zoom, 0, 2 * zoom);
    kiwi.add(rightFoot);

    return kiwi;
}

function Road() {
    const road = new THREE.Group();

    const createSection = color => new THREE.Mesh(
        new THREE.PlaneGeometry(boardWidth * zoom, positionWidth * zoom),
        new THREE.MeshPhongMaterial({ color })
    );

    const middle = createSection(0x454A59);
    middle.receiveShadow = true;
    road.add(middle);

    const left = createSection(0x393D49);
    left.position.x = -boardWidth * zoom;
    road.add(left);

    const right = createSection(0x393D49);
    right.position.x = boardWidth * zoom;
    road.add(right);

    return road;
}

function Grass() {
    const grass = new THREE.Group();

    const createSection = color => new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth * zoom, positionWidth * zoom, 3 * zoom),
        new THREE.MeshPhongMaterial({ color })
    );

    const middle = createSection(0xbaf455);
    middle.receiveShadow = true;
    grass.add(middle);

    const left = createSection(0x99C846);
    left.position.x = -boardWidth * zoom;
    grass.add(left);

    const right = createSection(0x99C846);
    right.position.x = boardWidth * zoom;
    grass.add(right);

    grass.position.z = 1.5 * zoom;
    return grass;
}

function Water() {
    const water = new THREE.Group();

    const createSection = color => new THREE.Mesh(
        new THREE.PlaneGeometry(boardWidth * zoom, positionWidth * zoom),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.8 })
    );

    const middle = createSection(0x4A90E2);
    middle.receiveShadow = true;
    water.add(middle);

    const left = createSection(0x357ABD);
    left.position.x = -boardWidth * zoom;
    water.add(left);

    const right = createSection(0x357ABD);
    right.position.x = boardWidth * zoom;
    water.add(right);

    return water;
}

function Lane(index) {
    this.index = index;
    
    // Reduce river frequency - only 10% chance instead of 25%
    if (index <= 0) {
        this.type = 'field';
    } else {
        const rand = Math.random();
        if (rand < 0.1) {
            this.type = 'river';
        } else if (rand < 0.4) {
            this.type = 'forest';
        } else if (rand < 0.7) {
            this.type = 'car';
        } else {
            this.type = 'truck';
        }
    }

    switch (this.type) {
        case 'field': {
            this.type = 'field';
            this.mesh = new Grass();
            break;
        }
        case 'forest': {
            this.mesh = new Grass();

            this.occupiedPositions = new Set();
            this.trees = [1, 2, 3, 4].map(() => {
                const tree = new Tree();
                let position;
                do {
                    position = Math.floor(Math.random() * columns);
                } while (this.occupiedPositions.has(position))
                this.occupiedPositions.add(position);
                tree.position.x = (position * positionWidth + positionWidth / 2) * zoom - boardWidth * zoom / 2;
                this.mesh.add(tree);
                return tree;
            })
            break;
        }
        case 'car': {
            this.mesh = new Road();
            this.direction = Math.random() >= 0.5;

            const occupiedPositions = new Set();
            this.vehicles = [1, 2, 3, 4].map(() => {
                const vehicle = new Car();
                let position;
                do {
                    position = Math.floor(Math.random() * columns / 2);
                } while (occupiedPositions.has(position))
                occupiedPositions.add(position);
                vehicle.position.x = (position * positionWidth * 2 + positionWidth / 2) * zoom - boardWidth * zoom / 2;
                if (!this.direction) vehicle.rotation.z = Math.PI;
                this.mesh.add(vehicle);
                return vehicle;
            })

            this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)];
            break;
        }
        case 'truck': {
            this.mesh = new Road();
            this.direction = Math.random() >= 0.5;

            const occupiedPositions = new Set();
            this.vehicles = [1, 2, 3].map(() => {
                const vehicle = new Truck();
                let position;
                do {
                    position = Math.floor(Math.random() * columns / 3);
                } while (occupiedPositions.has(position))
                occupiedPositions.add(position);
                vehicle.position.x = (position * positionWidth * 3 + positionWidth / 2) * zoom - boardWidth * zoom / 2;
                if (!this.direction) vehicle.rotation.z = Math.PI;
                this.mesh.add(vehicle);
                return vehicle;
            })

            this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)];
            break;
        }
        case 'river': {
            this.mesh = new Water();
            this.direction = Math.random() >= 0.5;

            const occupiedPositions = new Set();
            this.logs = [1, 2, 3].map(() => {
                const log = new Log();
                let position;
                do {
                    position = Math.floor(Math.random() * columns / 2);
                } while (occupiedPositions.has(position))
                occupiedPositions.add(position);
                log.position.x = (position * positionWidth * 2 + positionWidth / 2) * zoom - boardWidth * zoom / 2;
                if (!this.direction) log.rotation.z = Math.PI;
                this.mesh.add(log);
                return log;
            })

            this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)] * 0.7; // Logs move slower
            break;
        }
    }
}

const generateLanes = () => [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => {
    const lane = new Lane(index);
    lane.mesh.position.y = index * positionWidth * zoom;
    scene.add(lane.mesh);
    return lane;
}).filter((lane) => lane.index >= 0);

const addLane = () => {
    const index = lanes.length;
    const lane = new Lane(index);
    lane.mesh.position.y = index * positionWidth * zoom;
    scene.add(lane.mesh);
    lanes.push(lane);
}

const goose = new Chicken();
scene.add(goose);

const initialiseValues = () => {
    lanes = generateLanes();

    currentLane = 0;
    currentColumn = Math.floor(columns / 2);

    previousTimestamp = null;

    startMoving = false;
    moves = [];
    stepStartTimestamp = null;

    goose.position.x = 0;
    goose.position.y = 0;

    camera.position.y = initialCameraPositionY;
    camera.position.x = initialCameraPositionX;

    counterDOM.innerHTML = '0 / 22';
    
    isOnLog = false;
    currentLogSpeed = 0;
}

initialiseValues();

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(-100, -100, 200);
dirLight.castShadow = true;
scene.add(dirLight);

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
const d = 500;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;

const backLight = new THREE.DirectionalLight(0x000000, 0.4);
backLight.position.set(200, 200, 50);
backLight.castShadow = true;
scene.add(backLight);

document.querySelector("#retry").addEventListener("click", () => {
    lanes.forEach(lane => scene.remove(lane.mesh));
    initialiseValues();
    endDOM.style.visibility = 'hidden';
});

document.getElementById('forward').addEventListener("click", () => move('forward'));
document.getElementById('backward').addEventListener("click", () => move('backward'));
document.getElementById('left').addEventListener("click", () => move('left'));
document.getElementById('right').addEventListener("click", () => move('right'));

window.addEventListener("keydown", event => {
    if (event.keyCode == '38' || event.key === 'w' || event.key === 'W') {
        move('forward');
    }
    else if (event.keyCode == '40' || event.key === 's' || event.key === 'S') {
        move('backward');
    }
    else if (event.keyCode == '37' || event.key === 'a' || event.key === 'A') {
        move('left');
    }
    else if (event.keyCode == '39' || event.key === 'd' || event.key === 'D') {
        move('right');
    }
});

function move(direction) {
    const finalPositions = moves.reduce((position, move) => {
        if (move === 'forward') return { lane: position.lane + 1, column: position.column };
        if (move === 'backward') return { lane: position.lane - 1, column: position.column };
        if (move === 'left') return { lane: position.lane, column: position.column - 1 };
        if (move === 'right') return { lane: position.lane, column: position.column + 1 };
    }, { lane: currentLane, column: currentColumn })

    if (direction === 'forward') {
        if (lanes[finalPositions.lane + 1].type === 'forest' && lanes[finalPositions.lane + 1].occupiedPositions.has(finalPositions.column)) return;
        if (!stepStartTimestamp) startMoving = true;
        addLane();
    }
    else if (direction === 'backward') {
        if (finalPositions.lane === 0) return;
        if (lanes[finalPositions.lane - 1].type === 'forest' && lanes[finalPositions.lane - 1].occupiedPositions.has(finalPositions.column)) return;
        if (!stepStartTimestamp) startMoving = true;
    }
    else if (direction === 'left') {
        if (finalPositions.column === 0) return;
        if (lanes[finalPositions.lane].type === 'forest' && lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column - 1)) return;
        if (!stepStartTimestamp) startMoving = true;
    }
    else if (direction === 'right') {
        if (finalPositions.column === columns - 1) return;
        if (lanes[finalPositions.lane].type === 'forest' && lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column + 1)) return;
        if (!stepStartTimestamp) startMoving = true;
    }
    moves.push(direction);
}

function animate(timestamp) {
    requestAnimationFrame(animate);

    if (!previousTimestamp) previousTimestamp = timestamp;
    const delta = timestamp - previousTimestamp;
    previousTimestamp = timestamp;

    // Animate cars, trucks, and logs moving on the lane
    lanes.forEach(lane => {
        if (lane.type === 'car' || lane.type === 'truck') {
            const aBitBeforeTheBeginningOfLane = -boardWidth * zoom / 2 - positionWidth * 2 * zoom;
            const aBitAfterTheEndOfLane = boardWidth * zoom / 2 + positionWidth * 2 * zoom;
            lane.vehicles.forEach(vehicle => {
                if (lane.direction) {
                    vehicle.position.x = vehicle.position.x < aBitBeforeTheBeginningOfLane ? aBitAfterTheEndOfLane : vehicle.position.x -= lane.speed / 16 * delta;
                } else {
                    vehicle.position.x = vehicle.position.x > aBitAfterTheEndOfLane ? aBitBeforeTheBeginningOfLane : vehicle.position.x += lane.speed / 16 * delta;
                }
            });
        }
        if (lane.type === 'river') {
            const aBitBeforeTheBeginningOfLane = -boardWidth * zoom / 2 - positionWidth * 2 * zoom;
            const aBitAfterTheEndOfLane = boardWidth * zoom / 2 + positionWidth * 2 * zoom;
            lane.logs.forEach(log => {
                if (lane.direction) {
                    log.position.x = log.position.x < aBitBeforeTheBeginningOfLane ? aBitAfterTheEndOfLane : log.position.x -= lane.speed / 16 * delta;
                } else {
                    log.position.x = log.position.x > aBitAfterTheEndOfLane ? aBitBeforeTheBeginningOfLane : log.position.x += lane.speed / 16 * delta;
                }
            });
        }
    });

    if (startMoving) {
        stepStartTimestamp = timestamp;
        startMoving = false;
    }

    // If chicken is on a log, move it with the log
    if (isOnLog && !stepStartTimestamp) {
        goose.position.x += currentLogSpeed / 16 * delta;
        // Don't move camera with the chicken on log
    }

    if (stepStartTimestamp) {
        const moveDeltaTime = timestamp - stepStartTimestamp;
        const moveDeltaDistance = Math.min(moveDeltaTime / stepTime, 1) * positionWidth * zoom;
        const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime / stepTime, 1) * Math.PI) * 8 * zoom;
        switch (moves[0]) {
            case 'forward': {
                camera.position.y = initialCameraPositionY + currentLane * positionWidth * zoom + moveDeltaDistance;
                goose.position.y = currentLane * positionWidth * zoom + moveDeltaDistance;
                goose.position.z = jumpDeltaDistance;
                break;
            }
            case 'backward': {
                camera.position.y = initialCameraPositionY + currentLane * positionWidth * zoom - moveDeltaDistance;
                goose.position.y = currentLane * positionWidth * zoom - moveDeltaDistance;
                goose.position.z = jumpDeltaDistance;
                break;
            }
            case 'left': {
                // Camera doesn't follow left/right movement
                goose.position.x = (currentColumn * positionWidth + positionWidth / 2) * zoom - boardWidth * zoom / 2 - moveDeltaDistance;
                goose.position.z = jumpDeltaDistance;
                break;
            }
            case 'right': {
                // Camera doesn't follow left/right movement
                goose.position.x = (currentColumn * positionWidth + positionWidth / 2) * zoom - boardWidth * zoom / 2 + moveDeltaDistance;
                goose.position.z = jumpDeltaDistance;
                break;
            }
        }
        // Once a step has ended
        if (moveDeltaTime > stepTime) {
            switch (moves[0]) {
                case 'forward': {
                    currentLane++;
                    counterDOM.innerHTML = `${currentLane} / 22`;
                    // Check if won
                    if (currentLane >= maxScore) {
                        // Redirect to win page
                        window.location.href = 'win.html';
                    }
                    break;
                }
                case 'backward': {
                    currentLane--;
                    counterDOM.innerHTML = `${currentLane} / 22`;
                    break;
                }
                case 'left': {
                    currentColumn--;
                    break;
                }
                case 'right': {
                    currentColumn++;
                    break;
                }
            }
            moves.shift();
            // If more steps are to be taken then restart counter otherwise stop stepping
            stepStartTimestamp = moves.length === 0 ? null : timestamp;
        }
    }

    // Hit test for cars and trucks
    if (lanes[currentLane].type === 'car' || lanes[currentLane].type === 'truck') {
        const gooseMinX = goose.position.x - gooseSize * zoom / 2;
        const gooseMaxX = goose.position.x + gooseSize * zoom / 2;
        const vehicleLength = { car: 60, truck: 105 }[lanes[currentLane].type];
        lanes[currentLane].vehicles.forEach(vehicle => {
            const carMinX = vehicle.position.x - vehicleLength * zoom / 2;
            const carMaxX = vehicle.position.x + vehicleLength * zoom / 2;
            if (gooseMaxX > carMinX && gooseMinX < carMaxX) {
                endDOM.style.visibility = 'visible';
            }
        });
    }

    // River logic - check if chicken is on a log
    if (lanes[currentLane].type === 'river') {
        const gooseMinX = goose.position.x - gooseSize * zoom / 2;
        const gooseMaxX = goose.position.x + gooseSize * zoom / 2;
        const logLength = 80;
        
        isOnLog = false;
        currentLogSpeed = 0;
        
        lanes[currentLane].logs.forEach(log => {
            const logMinX = log.position.x - logLength * zoom / 2;
            const logMaxX = log.position.x + logLength * zoom / 2;
            if (gooseMaxX > logMinX && gooseMinX < logMaxX) {
                isOnLog = true;
                currentLogSpeed = lanes[currentLane].direction ? -lanes[currentLane].speed : lanes[currentLane].speed;
            }
        });
        
        // If not on a log, chicken drowns
        if (!isOnLog && !stepStartTimestamp) {
            endDOM.style.visibility = 'visible';
        }
        
        // Check if chicken moved off the edge while on a log
        if (Math.abs(goose.position.x) > boardWidth * zoom / 2) {
            endDOM.style.visibility = 'visible';
        }
    } else {
        isOnLog = false;
        currentLogSpeed = 0;
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);
