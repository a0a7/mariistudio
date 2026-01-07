import * as THREE from 'three';

export class Car {
    constructor(scene, x, z, speed) {
        this.scene = scene;
        this.speed = speed;
        this.createMesh(x, z);
    }
    
    createMesh(x, z) {
        const group = new THREE.Group();
        
        // Random car color
        const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181, 0xAA96DA];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.2, 0.4, 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.2;
        body.castShadow = true;
        group.add(body);
        
        // Car top (cabin)
        const topGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.55);
        const topMaterial = new THREE.MeshPhongMaterial({ color: color });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(0, 0.55, 0);
        top.castShadow = true;
        group.add(top);
        
        // Windows
        const windowGeometry = new THREE.BoxGeometry(0.65, 0.25, 0.5);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.6
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(0, 0.55, 0);
        group.add(window);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            [-0.4, 0.15, -0.35],
            [-0.4, 0.15, 0.35],
            [0.4, 0.15, -0.35],
            [0.4, 0.15, 0.35]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            group.add(wheel);
        });
        
        // Rotate car based on direction
        if (this.speed < 0) {
            group.rotation.y = Math.PI;
        }
        
        group.position.set(x, 0.5, z);
        this.mesh = group;
        this.scene.add(this.mesh);
    }
    
    update() {
        this.mesh.position.x += this.speed;
    }
    
    remove() {
        this.scene.remove(this.mesh);
        this.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
