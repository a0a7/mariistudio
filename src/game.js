import * as THREE from 'three';
import { Player } from './models/player.js';
import { Road } from './models/road.js';
import { Car } from './models/car.js';
import { InputController } from './controls/input.js';
import { checkCollision } from './utils/collision.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        this.score = 0;
        this.gameOver = false;
        this.maxScore = 0;
        
        // Game objects
        this.roads = [];
        this.cars = [];
        this.lanes = [];
        
        // Initialize game
        this.init();
    }
    
    init() {
        // Setup camera
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Create player
        this.player = new Player(this.scene);
        
        // Create initial roads
        this.generateWorld();
        
        // Input controller
        this.inputController = new InputController(this.player, this);
        
        // Fog for depth
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 50);
    }
    
    generateWorld() {
        const laneWidth = 2;
        const numLanes = 20;
        
        for (let i = 0; i < numLanes; i++) {
            const z = -i * laneWidth;
            const laneType = Math.random() > 0.3 ? 'road' : 'grass';
            
            this.lanes.push({ z, type: laneType });
            
            const road = new Road(this.scene, z, laneType);
            this.roads.push(road);
            
            if (laneType === 'road' && i > 2) {
                const numCars = Math.floor(Math.random() * 2) + 1;
                const direction = Math.random() > 0.5 ? 1 : -1;
                const speed = (Math.random() * 0.03 + 0.02) * direction;
                
                for (let j = 0; j < numCars; j++) {
                    const x = (Math.random() - 0.5) * 10;
                    const car = new Car(this.scene, x, z, speed);
                    this.cars.push(car);
                }
            }
        }
    }
    
    generateNewLane() {
        const laneWidth = 2;
        const lastLane = this.lanes[this.lanes.length - 1];
        const newZ = lastLane.z - laneWidth;
        const laneType = Math.random() > 0.3 ? 'road' : 'grass';
        
        this.lanes.push({ z: newZ, type: laneType });
        
        const road = new Road(this.scene, newZ, laneType);
        this.roads.push(road);
        
        if (laneType === 'road') {
            const numCars = Math.floor(Math.random() * 2) + 1;
            const direction = Math.random() > 0.5 ? 1 : -1;
            const speed = (Math.random() * 0.03 + 0.02) * direction;
            
            for (let j = 0; j < numCars; j++) {
                const x = (Math.random() - 0.5) * 10;
                const car = new Car(this.scene, x, newZ, speed);
                this.cars.push(car);
            }
        }
        
        // Remove old lanes
        if (this.roads.length > 25) {
            const oldRoad = this.roads.shift();
            oldRoad.remove();
            this.lanes.shift();
        }
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update cars
        this.cars.forEach((car, index) => {
            car.update();
            
            // Remove cars that are too far
            if (Math.abs(car.mesh.position.x) > 20) {
                car.remove();
                this.cars.splice(index, 1);
            }
            
            // Check collision with player
            if (checkCollision(this.player.mesh, car.mesh)) {
                this.endGame();
            }
        });
        
        // Update camera to follow player
        this.camera.position.z = this.player.mesh.position.z + 15;
        this.camera.position.x = this.player.mesh.position.x * 0.3;
        this.camera.lookAt(
            this.player.mesh.position.x,
            0,
            this.player.mesh.position.z
        );
        
        // Generate new lanes as player progresses
        if (this.player.mesh.position.z < this.lanes[this.lanes.length - 1].z + 10) {
            this.generateNewLane();
        }
        
        // Update score based on progress
        const currentProgress = Math.floor(-this.player.mesh.position.z / 2);
        if (currentProgress > this.score) {
            this.score = currentProgress;
            this.updateScore();
        }
        
        // Check if player fell off the world
        if (Math.abs(this.player.mesh.position.x) > 12) {
            this.endGame();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }
    
    endGame() {
        this.gameOver = true;
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
    }
    
    restart() {
        // Remove all game objects
        this.roads.forEach(road => road.remove());
        this.cars.forEach(car => car.remove());
        this.player.reset();
        
        // Reset arrays
        this.roads = [];
        this.cars = [];
        this.lanes = [];
        
        // Reset game state
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
        
        // Reset camera
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Regenerate world
        this.generateWorld();
        
        // Hide game over screen
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
