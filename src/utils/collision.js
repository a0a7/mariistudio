import * as THREE from 'three';

export function checkCollision(object1, object2) {
    // Simple bounding box collision detection
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);
    
    return box1.intersectsBox(box2);
}

export function checkDistance(object1, object2, maxDistance) {
    const distance = object1.position.distanceTo(object2.position);
    return distance < maxDistance;
}
