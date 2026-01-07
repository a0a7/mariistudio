export class InputController {
    constructor(player, game) {
        this.player = player;
        this.game = game;
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.game.gameOver) return;
            
            // Prevent default arrow key scrolling
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            
            if (!this.keys[e.key]) {
                this.keys[e.key] = true;
                this.handleKeyPress(e.key);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (this.game.gameOver) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (this.game.gameOver) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) {
                    this.player.move('right');
                } else if (deltaX < -30) {
                    this.player.move('left');
                }
            } else {
                if (deltaY > 30) {
                    this.player.move('backward');
                } else if (deltaY < -30) {
                    this.player.move('forward');
                }
            }
        });
    }
    
    handleKeyPress(key) {
        switch(key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.player.move('forward');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.player.move('backward');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.player.move('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.player.move('right');
                break;
        }
    }
}
