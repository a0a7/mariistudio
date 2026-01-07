import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.createMesh();
        this.isMoving = false;
        this.targetPosition = new THREE.Vector3(0, 0.5, 0);
        this.moveSpeed = 0.2;
    }
    
    createMesh() {
        // Create a cute character-like player
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4CAF50 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0x66BB6A });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.05;
        head.castShadow = true;
        group.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.1, 0.25);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 1.1, 0.25);
        group.add(rightEye);
        
        group.position.set(0, 0.5, 0);
        this.mesh = group;
        this.scene.add(this.mesh);
    }
    
    move(direction) {
        if (this.isMoving) return;
        
        const moveDistance = 2;
        this.isMoving = true;
        
        switch(direction) {
            case 'forward':
                this.targetPosition.z -= moveDistance;
                break;
            case 'backward':
                this.targetPosition.z += moveDistance;
                break;
            case 'left':
                this.targetPosition.x -= moveDistance;
                break;
            case 'right':
                this.targetPosition.x += moveDistance;
                break;
        }
        
        // Animate movement
        this.animateMove();
    }
    
    animateMove() {
        const startPos = this.mesh.position.clone();
        const distance = startPos.distanceTo(this.targetPosition);
        
        if (distance < 0.1) {
            this.mesh.position.copy(this.targetPosition);
            this.isMoving = false;
            return;
        }
        
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, this.mesh.position)
            .normalize();
        
        this.mesh.position.add(direction.multiplyScalar(this.moveSpeed));
        
        // Add a small hop animation
        const progress = 1 - (distance / 2);
        this.mesh.position.y = 0.5 + Math.sin(progress * Math.PI) * 0.3;
        
        if (this.isMoving) {
            requestAnimationFrame(() => this.animateMove());
        }
    }
    
    reset() {
        this.mesh.position.set(0, 0.5, 0);
        this.targetPosition.set(0, 0.5, 0);
        this.isMoving = false;
    }
}
