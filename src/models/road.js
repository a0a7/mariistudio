import * as THREE from 'three';

export class Road {
    constructor(scene, z, type = 'road') {
        this.scene = scene;
        this.z = z;
        this.type = type;
        this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.PlaneGeometry(20, 2);
        
        let material;
        if (this.type === 'road') {
            material = new THREE.MeshPhongMaterial({ 
                color: 0x333333,
                side: THREE.DoubleSide
            });
        } else {
            material = new THREE.MeshPhongMaterial({ 
                color: 0x228B22,
                side: THREE.DoubleSide
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.set(0, 0, this.z);
        this.mesh.receiveShadow = true;
        
        this.scene.add(this.mesh);
        
        // Add road markings for road lanes
        if (this.type === 'road') {
            this.addRoadMarkings();
        } else {
            this.addGrassDetails();
        }
    }
    
    addRoadMarkings() {
        const lineGeometry = new THREE.PlaneGeometry(0.2, 0.5);
        const lineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        
        for (let x = -8; x <= 8; x += 2) {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.01, this.z);
            this.scene.add(line);
        }
    }
    
    addGrassDetails() {
        // Add random grass patches for visual variety
        const numPatches = Math.floor(Math.random() * 3);
        for (let i = 0; i < numPatches; i++) {
            const x = (Math.random() - 0.5) * 18;
            const patchGeometry = new THREE.CircleGeometry(0.3, 8);
            const patchMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x1a7a1a,
                side: THREE.DoubleSide
            });
            const patch = new THREE.Mesh(patchGeometry, patchMaterial);
            patch.rotation.x = -Math.PI / 2;
            patch.position.set(x, 0.01, this.z);
            this.scene.add(patch);
        }
    }
    
    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
