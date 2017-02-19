// --- constants ---

const CELL_WIDTH = 20;
const CELL_HEIGHT = 20;

const LINE_WIDTH = 4;
const LINE_SPACER = 10;
const DOT_SIZE = 4;

const POWER_RADIUS_MAX = 8;
const POWER_RADIUS_MIN = 4;
const POWER_RAD_DELTA = 0.2;

const PAC_RADIUS = CELL_WIDTH - 4;
const GHOST_RADIUS = CELL_WIDTH - 4;
const GHOST_EYE_RADIUS = 5;
const GHOST_EYE_X = 7;
const GHOST_EYE_Y = 5;
const GHOST_PUPIL_RADIUS = 2;
const GHOST_EYE_D = 3;

const BOARD_X = 40;
const BOARD_Y = 40;

const CANVAS_NAMES = ['board', 'main'];

const BACKGROUND_FILL_STYLE = '#666';
const LINE_COLOR1 = '#001188';
const LINE_COLOR2 = '#0070E0';	// DropboxBlue
const DOT_COLOR = '#ffff88';
const POWER_COLOR = 'white';

const PAC_COLOR = '#ffff88';
const PAC_SPEED = 2;
const PAC_ANGLE_PARTS = 8;
const PAC_ANGLE_PART = Math.PI / 5 / PAC_ANGLE_PARTS;
const PAC_ANGLE_90 = Math.PI / 2;

const PAC_DEATH_PARTS = 80;
const PAC_DEATH_PART_START = 70;
const PAC_DEATH_PART = Math.PI / PAC_DEATH_PARTS;

const GHOST_IDS = ['1','2','3','4'];
const GHOST_COLORS = ['red', 'pink', 'cyan', 'orange'];
const GHOST_RUNNING_COLOR = 'blue';
const GHOST_SPEED = 2;
const GHOST_RUNNING_SPEED = 1;
const GHOST_RUNNING_WARN = 60*4;
const GHOST_RUNNING_TIME = 60*8;

			// up, right, down, left
const DIR_X = [0, 1, 0, -1];
const DIR_Y = [-1, 0, 1, 0];

// --- Game Map ---

const CODE_MAP = [
	"A============================B",
	"I............................H",
	"I.a---b..a-------b a-------b.H",
	"I*|a-bdb.d-------c d-------c*H",
	"I.|| db|....      1      ....H",
	"I.||  ||.a---b W_>~<_X a---b.H",
	"I.||  ||.|a--c H 2 3 I |a-b|.H",
	"I.||  ||.||.   H     I || ||.H",
	"I.||  ||.||.ab H  4  I || ||.H",
	"I.|d--c|.||.|| H     I |d-c|.H",
	"I.d----c.dc.dc Z=====Y |a--c.H",
	"I...........           ||....H",
	"D__X.ab.a----b a-----b ||.W__C",
	"===Y.||.d----c d-----c dc.Z===",
	"   :.||.......... P ......:   ",
	"___X.|d---b.a----b a-ba-b.W___",
	"A==Y.|a--b|.|a--b|.| dc |.Z==B",
	"I....||  ||.||  ||.db  ac....H",
	"I.ab.||  ||.||  ||.ac  db.ab.H",
	"I*||.|d--c|.|d--c|.| ab |.||*H",
	"I.dc.d----c.d----c.d-cd-c.dc.H",
	"I............................H",
	"D____________________________C",
]

const HELPER_MAP = [
	"111111111111111111111111111111",
	"1x      x         x         x1",
	"1 22222  111111111 111111111 1",
	"1 222222 111111111 111111111 1",
	"1 222222x     x   x   x     x1",
	"1 222222 22222 2222222 22222 1",
	"1 222222 22222 2     2 22222 1",
	"1 222222 22x  x2     2 22 22 1",
	"1 222222 22 11 2     2 22 22 1",
	"1 222222 22 11 2     2 22222 1",
	"1 222222 22 11 2222222 22222 1",
	"1x  x  xx  x  x       x22x  x1",
	"1111 22 111111 1111111 22 1111",
	"1111 22 111111 1111111 22 1111",
	"    x22x   x  x   x   x  x    ",
	"1111 222222 222222 222222 1111",
	"1111 222222 222222 2 22 2 1111",
	"1x  x22  22 22  22 22  22x  x1",
	"1 11 22  22 22  22 22  22 11 1",
	"1 11 222222 222222 2 22 2 11 1",
	"1 11 222222 222222 222222 11 1",
	"1x  x      x      x      x  x1",
	"111111111111111111111111111111",
]

const WALL_TILES = "abcd-|ABCD=H_IWXYZ>~<:";


// --- global valiables ---

var dots = new Array(CODE_MAP.length);
var dots_left = 0;
var score = 0;
var game_mode = 'starting';
var power_rad = POWER_RADIUS_MIN;
var power_dir = 1;
var ghost_mode = 'hunting';
var ghost_running_counter = 0;
	

// --- Actors ---

class Actor {
	constructor(ctx, ch, speed, isBlockedByInvWall) {
		this.ctx = ctx;

		this.cell_x = 0;		// this is the cell position in the map (range 0..18 or so)
		this.cell_y = 0;
		this.dx = 0;			// this is the gxel offset from the cell boundary (range 0..CELL_WIDTH)
		this.dy = 0;

		this.last_dx = 0;
		this.last_dy = 0;

		this.speed = speed;
		this.speed_x = 0;
		this.speed_y = 0;

		var pos = findPosition(ch);
		this.cell_x = pos[0];
		this.cell_y = pos[1];

		this.is_moving = true;	// so its drawn at the first frame
		this.last_cell_x = this.cell_x;
		this.last_cell_y = this.cell_y;

		this.wall_collide = false;
		this.isBlocked = isBlockedByInvWall;
	}

	command() {			// make direction / speed decisions	
	}

	move() {			// apply the speed to generate a new position
		// remember the last position for nice clearing in a minute
		this.last_cell_x = this.cell_x;
		this.last_cell_y = this.cell_y;
		this.last_dx = this.dx;
		this.last_dy = this.dy;

		// compute next positioon
		var new_cell_x = this.cell_x;
		var new_cell_y = this.cell_y;
		var new_dx = this.dx + this.speed_x;
		var new_dy = this.dy + this.speed_y;

		this.wall_collide = false;

		if (this.speed_x < 0) {		// moving left
			if (new_dx < 0) {
				new_cell_x = this.cell_x - 1;
				new_dx = CELL_WIDTH-this.speed;
				
				// detect left warp
				if (new_cell_x < 0) {
					new_cell_x = CODE_MAP[0].length - 2;
				}
			}
			this.wall_collide = isWall(new_cell_x, new_cell_y, this.isBlocked);
		}

		if (this.speed_x > 0) {		// moving right
			if (new_dx >= CELL_HEIGHT) {
				new_cell_x = this.cell_x + 1;
				new_dx = 0;

				// detect right warp
				if (new_cell_x >= CODE_MAP[0].length-1) {
					new_cell_x = 0;
				}
			}
			this.wall_collide = isWall(new_cell_x+1, new_cell_y, this.isBlocked) && new_dx > 0;
		}
		
		if (this.speed_y < 0) {		// moving up
			if (new_dy < 0) {
				new_cell_y = this.cell_y - 1;
				new_dy = CELL_HEIGHT-this.speed;
			}
			this.wall_collide = isWall(new_cell_x, new_cell_y, this.isBlocked);
		}

		if (this.speed_y > 0) {		// moving down
			if (new_dy >= CELL_HEIGHT) {
				new_cell_y = this.cell_y + 1;
				new_dy = 0;
			}
			this.wall_collide = isWall(new_cell_x, new_cell_y+1, this.isBlocked) && new_dy > 0;
		}

		if (this.speed_x == 0 && this.speed_y == 0) {
			// stopped already
			this.is_moving = false;
		} else if (this.wall_collide) {
			// need to stop
			// don't keep the new position, and no need to redraw.
			this.stop();
		} else {
			// still moving
			// keep the new position
			this.cell_x = new_cell_x;
			this.cell_y = new_cell_y;
			this.dx = new_dx;			
			this.dy = new_dy;
			this.is_moving = true;
		}		
	}

	stop() {
		this.speed_x = 0;
		this.speed_y = 0;
		// no need to redraw
		this.is_moving = false;
	}

	draw() {			// clear old position and draw new position
	}

	getPosition() {
		return [this.cell_x, this.cell_y, this.dx, this.dy];
	}
}

class Pacman extends Actor {
	constructor(ctx, ch) {
		super(ctx, ch, PAC_SPEED, false);
		this.anim_slide = PAC_ANGLE_PARTS-1;
		this.anim_dir = -1;		// mouth closing

		this.death_slide = PAC_DEATH_PART_START;
	}

	command() {
		// --- check what's around me ---

		var clear_above = !isWall(this.cell_x, this.cell_y-1, 0) && this.dx == 0;
		var clear_right = !isWall(this.cell_x+1, this.cell_y, 0) && this.dy == 0;
		var clear_down = !isWall(this.cell_x, this.cell_y+1, 0) && this.dx == 0;
		var clear_left = !isWall(this.cell_x-1, this.cell_y, 0) && this.dy == 0;

		// --- keys affect the speed/direction ---

		if (KEY_STATUS.up && clear_above) {
			this.speed_x = 0;
			this.speed_y = -this.speed;
		} else if (KEY_STATUS.down && clear_down) {
			this.speed_x = 0;
			this.speed_y = this.speed;
		} else if (KEY_STATUS.left && clear_left) {
			this.speed_x = -this.speed;
			this.speed_y = 0;
		} else if (KEY_STATUS.right && clear_right) {
			this.speed_x = this.speed;
			this.speed_y = 0;
		}
		// otherwise, the pac continues at the same speed as before
	}

	move() {
		super.move();

		// --- movement ---

		if (this.speed_x != 0 || this.speed_y != 0) {
			// advance mouth animation
			if (this.anim_dir > 0) {
				this.anim_slide += 1;
				if (this.anim_slide == PAC_ANGLE_PARTS) {
					this.anim_dir = -1;
				}
			} else {
				this.anim_slide -= 1;
				if (this.anim_slide == 0) {
					this.anim_dir = 1;
				}
			}
		}

		// --- check collision with dots ---

		if (this.speed_x < 0 && dots[this.cell_y][this.cell_x] == '.' && this.dx == PAC_RADIUS) {
			eatDot(this.cell_x, this.cell_y, this.ctx);
		} else if (this.speed_y < 0 && dots[this.cell_y][this.cell_x] == '.' && this.dy == PAC_RADIUS) {
			eatDot(this.cell_x, this.cell_y, this.ctx);

		} else if (this.speed_x > 0 && dots[this.cell_y][this.cell_x] == '.' && this.dx == 0) {	// due to bug
			eatDot(this.cell_x, this.cell_y, this.ctx);
		} else if (this.speed_x > 0 && dots[this.cell_y][this.cell_x + 1] == '.' && this.dx == 6) {
			eatDot(this.cell_x + 1, this.cell_y, this.ctx);
		
		} else if (this.speed_y > 0 && dots[this.cell_y][this.cell_x] == '.' && this.dy == 0) {	// due to bug
			eatDot(this.cell_x, this.cell_y, this.ctx);
		} else if (this.speed_y > 0 && dots[this.cell_y + 1][this.cell_x] == '.' && this.dy == 6) {
			eatDot(this.cell_x, this.cell_y + 1, this.ctx);
		}

		// --- check collision with power pallets ---

		if (this.speed_x < 0 && dots[this.cell_y][this.cell_x] == '*' && this.dx == PAC_RADIUS) {
			eatPallet(this.cell_x, this.cell_y, this.ctx);
		} else if (this.speed_y < 0 && dots[this.cell_y][this.cell_x] == '*' && this.dy == PAC_RADIUS) {
			eatPallet(this.cell_x, this.cell_y, this.ctx);

		} else if (this.speed_x > 0 && dots[this.cell_y][this.cell_x + 1] == '*' && this.dx == 0) {
			eatPallet(this.cell_x + 1, this.cell_y, this.ctx);
		
		} else if (this.speed_y > 0 && dots[this.cell_y + 1][this.cell_x] == '*' && this.dy == 0) {
			eatPallet(this.cell_x, this.cell_y + 1, this.ctx);
		}

		var a = 0;
	}

	draw() {
		if (this.ctx && this.is_moving) {
			var pos_x = BOARD_X + this.cell_x*CELL_WIDTH + this.dx;
			var pos_y = BOARD_Y + this.cell_y*CELL_HEIGHT + this.dy;
			var center_x = pos_x + CELL_WIDTH/2;
			var center_y = pos_y + CELL_HEIGHT/2;

			// --- clear last position ---

			var last_x = BOARD_X + this.last_cell_x*CELL_WIDTH + this.last_dx - CELL_WIDTH/4-1;		// voodoo!
			var last_y = BOARD_Y + this.last_cell_y*CELL_HEIGHT + this.last_dy - CELL_WIDTH/4-1;
		    this.ctx.clearRect(last_x, last_y, (PAC_RADIUS)*2, (PAC_RADIUS)*2);			

		    // --- calculate the mouth animation ---

			var angle = PAC_ANGLE_PART * this.anim_slide + 0.01;
			var other_angle = -angle;

			var dir_angle = angle;
			var dir_other_angle = other_angle;

			if (this.speed_x < 0) {
				dir_angle = -PAC_ANGLE_90 * 2 + angle;
				dir_other_angle = PAC_ANGLE_90 * 2 - angle;
			} else if (this.speed_y < 0) {
				dir_angle = -PAC_ANGLE_90 + angle;
				dir_other_angle = -PAC_ANGLE_90 - angle;
			} else if (this.speed_y > 0) {
				dir_angle = PAC_ANGLE_90 + angle;
				dir_other_angle = PAC_ANGLE_90 - angle;
			}

			// --- draw new ---

			this.ctx.fillStyle = PAC_COLOR;
			this.ctx.beginPath();
			// ctx.arc(center_x, center_y, PAC_RADIUS, 0, 6.3);
			this.ctx.arc(center_x, center_y, PAC_RADIUS, dir_angle, dir_other_angle, false);
			this.ctx.lineTo(center_x, center_y);
			this.ctx.fill();
		}
	}

	deathAnim() {
		this.death_slide -= 1;
		if (this.death_slide >= 0) {
			var pos_x = BOARD_X + this.cell_x*CELL_WIDTH + this.dx;
			var pos_y = BOARD_Y + this.cell_y*CELL_HEIGHT + this.dy;
			var center_x = pos_x + CELL_WIDTH/2;
			var center_y = pos_y + CELL_HEIGHT/2;

			var angle_right = PAC_ANGLE_90 - this.death_slide*PAC_ANGLE_PART;
			var angle_left = PAC_ANGLE_90 + this.death_slide*PAC_ANGLE_PART;

			// --- clear last position ---

			var last_x = BOARD_X + this.last_cell_x*CELL_WIDTH + this.last_dx - CELL_WIDTH/4;		// voodoo!
			var last_y = BOARD_Y + this.last_cell_y*CELL_HEIGHT + this.last_dy - CELL_WIDTH/4;
		    this.ctx.clearRect(last_x-3, last_y-3, (PAC_RADIUS)*2+3, (PAC_RADIUS)*2+3);

		    // --- draw new ---

			this.ctx.fillStyle = PAC_COLOR;
			this.ctx.beginPath();
			// ctx.arc(center_x, center_y, PAC_RADIUS, 0, 6.3);
			this.ctx.arc(center_x, center_y, PAC_RADIUS, angle_right, angle_left, false);
			this.ctx.lineTo(center_x, center_y);
			this.ctx.fill();

			return false;
		} else {
			return true;
		}

		var a = 0;			
	}
}

class Ghost extends Actor {
	constructor(ctx, ch) {
		super(ctx, ch, GHOST_SPEED, true);
		this.id = ch.charCodeAt(0) - '0'.charCodeAt(0);
		this.color = GHOST_COLORS[this.id-1];

		if (this.id == 1) {	
			this.spawn();
		} else {
			this.alive_mode = 'spawning';
			this.spawn_timer = (this.id-1) * 60 * 1.5;
			this.dy = CELL_HEIGHT/2;	// ugly patch
		}
	}

	spawn() {
		this.clear();

		this.alive_mode = 'alive';
	    this.speed_x = -GHOST_SPEED;	// TODO: improve based on pac direction
	    this.cell_x = 18;
	    this.cell_y = 4;
	    this.dy = 0;
	}

	command(pac) {
		switch (this.alive_mode) {
			case 'spawning':
				this.spawn_timer--;
				if (this.spawn_timer <= 0) {
					this.spawn();
				}
				break;

			case 'alive':
				if (this.dx == 0 && this.dy == 0) {		// only on precise cell boundaries
					
					// find if its a decision point from the helper map
					var line = HELPER_MAP[this.cell_y];
					var c = line[this.cell_x];
					if (c == 'x') {
						// decision point!
						var chosen_dir = 0;

						// --- check available openings around me ---

						var clear = new Array();
						clear[0] = !isWall(this.cell_x, this.cell_y-1, 1) && this.dx == 0;	// up
						clear[1] = !isWall(this.cell_x+1, this.cell_y, 1) && this.dy == 0;	// right
						clear[2] = !isWall(this.cell_x, this.cell_y+1, 1) && this.dx == 0;	// down
						clear[3] = !isWall(this.cell_x-1, this.cell_y, 1) && this.dy == 0;	// left

						//this.wall_collide) {		// change direction only when hitting a wall

						// --- calculate target direction options ---

						var preferred_dirs = [];
						
						var delta_x = pac.cell_x - this.cell_x;
						var delta_y = pac.cell_y - this.cell_y;

						switch (ghost_mode) {
							case 'hunting':
								// use the chosen dir
								this.speed = GHOST_SPEED;
								break;

							case 'running':
								// reverse!!!
								delta_x = -delta_x;
								delta_y = -delta_y;
								this.speed = GHOST_RUNNING_SPEED;
								break;
						}

						if (Math.abs(delta_x) > Math.abs(delta_y)) {	// left or right is better
							if (delta_x > 0) {							// right
								preferred_dirs.push(1);	// right
							} else {
								preferred_dirs.push(3);	// left
							}
							if (delta_y > 0) {
								preferred_dirs.push(2);	// down
							} else {
								preferred_dirs.push(0);	// up
							}
						} else {										// up or down is better
							if (delta_y > 0) {							// down
								preferred_dirs.push(2);	// down
							} else {
								preferred_dirs.push(0);	// up
							}
							if (delta_x > 0) {
								preferred_dirs.push(1);	// right
							} else {
								preferred_dirs.push(3);	// left
							}
						}

						// --- choose a direction ---

						var dir = preferred_dirs[0];
						if (clear[dir]) {
							chosen_dir = dir;
						} else {
							dir = preferred_dirs[1];
							if (clear[dir]) {
								chosen_dir = dir;
							} else {
								// choose whatever is clear from what is left
								// TODO: Make it random
								for (var j=0; j<4; j++) {
									if (clear[j]) {
										chosen_dir = j;
									}
								}
							}
						}

						this.speed_x = this.speed * DIR_X[chosen_dir];
						this.speed_y = this.speed * DIR_Y[chosen_dir];

						// console.log(preferred_dirs + "| chosen: " + chosen_dir);
						var a = 0;
					}
				}
				break;

			case 'dead':
			default:
				break;
		}
	}

	move() {
		super.move();
	}

	clear() {
		// TODO: better clear...
		var pos_x = BOARD_X + this.cell_x*CELL_WIDTH + this.dx;
		var pos_y = BOARD_Y + this.cell_y*CELL_HEIGHT + this.dy;
		var center_x = pos_x + CELL_WIDTH/2;
		var center_y = pos_y + CELL_HEIGHT/2;
	    this.ctx.clearRect(center_x - GHOST_RADIUS-2, center_y - GHOST_RADIUS-2, GHOST_RADIUS*2+4, GHOST_RADIUS*2+4);
	}

	draw() {
		if (this.alive_mode == 'alive' || this.alive_mode == 'spawning') {

			if (this.ctx && this.is_moving) {
				var pos_x = BOARD_X + this.cell_x*CELL_WIDTH + this.dx;
				var pos_y = BOARD_Y + this.cell_y*CELL_HEIGHT + this.dy;
				var center_x = pos_x + CELL_WIDTH/2;
				var center_y = pos_y + CELL_HEIGHT/2;

				// --- clear last position ---
			    
			    this.clear();

			    // --- draw actual ghost ---

				switch (ghost_mode) {
					case 'hunting':
						this.ctx.fillStyle = this.color;
						break;

					case 'running':
						var a = 0;
						if (ghost_running_counter < GHOST_RUNNING_WARN) {
							var b = Math.floor(ghost_running_counter / GHOST_RUNNING_WARN * 8);
							if (b % 2) {
								this.ctx.fillStyle = GHOST_RUNNING_COLOR;
							} else {
								this.ctx.fillStyle = 'grey';
							}
						} else {
							this.ctx.fillStyle = GHOST_RUNNING_COLOR;
						}
						break;
				}
			    // this.ctx.fillRect(pos_x, pos_y, GHOST_RADIUS*2, GHOST_RADIUS*2);			
			    // top half
			    this.ctx.beginPath();
			    this.ctx.arc(center_x, center_y, GHOST_RADIUS, -Math.PI, 0, false);
			    this.ctx.fill();
			    
			    // bottom half
			    this.ctx.fillRect(center_x - GHOST_RADIUS, center_y, GHOST_RADIUS*2, GHOST_RADIUS);

			    // eyes
			    var dx = 0;
			    var dy = 0;

				if (this.speed_x > 0) {
					dx = GHOST_EYE_D;
				}
				if (this.speed_x < 0) {
					dx = -GHOST_EYE_D;
				}
				if (this.speed_y > 0) {
					dy = GHOST_EYE_D;
				}
				if (this.speed_y < 0) {
					dy = -GHOST_EYE_D;
				}

				this.ctx.fillStyle = 'white';
			    this.ctx.beginPath();
			    this.ctx.arc(center_x - GHOST_EYE_X +dx, center_y - GHOST_EYE_Y +dy, GHOST_EYE_RADIUS, 0, Math.PI * 2);
			    this.ctx.fill();
			    this.ctx.beginPath();
			    this.ctx.arc(center_x + GHOST_EYE_X +dx, center_y - GHOST_EYE_Y +dy, GHOST_EYE_RADIUS, 0, Math.PI * 2);
			    this.ctx.fill();

			    // pupils

				this.ctx.fillStyle = 'black';
			    this.ctx.beginPath();
			    this.ctx.arc(center_x - GHOST_EYE_X +2*dx, center_y - GHOST_EYE_Y +2*dy, GHOST_PUPIL_RADIUS, 0, Math.PI * 2);
			    this.ctx.fill();
			    this.ctx.beginPath();
			    this.ctx.arc(center_x + GHOST_EYE_X + 2*dx, center_y - GHOST_EYE_Y +2*dy, GHOST_PUPIL_RADIUS, 0, Math.PI * 2);
			    this.ctx.fill();
			}
		}
	}

	isCollideWithPac(pacman) {
		if (this.alive_mode == 'alive') {
			var pac_pos = pacman.getPosition();
			var pac_x = pac_pos[0];
			var pac_y = pac_pos[1];
			var pac_dx = pac_pos[2];
			var pac_dy = pac_pos[3];
			var pac_pos_x = BOARD_X + pac_x*CELL_WIDTH + pac_dx;
			var pac_pos_y = BOARD_Y + pac_y*CELL_HEIGHT + pac_dy;

			var pos_x = BOARD_X + this.cell_x*CELL_WIDTH + this.dx;
			var pos_y = BOARD_Y + this.cell_y*CELL_HEIGHT + this.dy;
			
			var collision = (pos_x < pac_pos_x + PAC_RADIUS*2 &&
							 pos_x + GHOST_RADIUS*2 > pac_pos_x &&
							 pos_y < pac_pos_y + PAC_RADIUS*2 &&
							 GHOST_RADIUS*2 + pos_y > pac_pos_y);
			
			if (collision) {
				if (ghost_mode == 'running') {
					this.clear();
					this.alive_mode = 'dead';
				}
			}

			return collision;
		} else {
			return false;
		}
	}
}

class Ghosts {
	constructor(ctx) {
		this.ghosts = [];
		for (let ch of GHOST_IDS) {
			var ghost = new Ghost(ctx, ch);
			this.ghosts.push(ghost);
		}
	}

	command(pac) {
		this.ghosts.forEach(function(g) {
			g.command(pac);
		})
	}

	move() {
		this.ghosts.forEach(function(g) {
			g.move();
		})
	}

	draw() {
		this.ghosts.forEach(function(g) {
			g.draw();
		})
	}

	stop() {
		this.ghosts.forEach(function(g) {
			g.stop();
		})
	}

	isCollideWithPac(pacman) {
		for (var j=0; j<this.ghosts.length; j++) {
			var ghost = this.ghosts[j];
			if (ghost.isCollideWithPac(pacman)) {
				return true;
			}
		}
		return false;
	}
}

class Game {
	constructor() {
		// --- init canvases contexts ---

		var board_canvas = document.getElementById('board');
		this.board_ctx = null;
		if (!board_canvas.getContext) {
			console.log('### Failed getting \'board\' context')
		} else {
			this.board_ctx = board_canvas.getContext('2d');
		}

		var main_canvas = document.getElementById('main');
		this.main_ctx = null;
		if (!main_canvas.getContext) {
			console.log('### Failed getting \'main\' context')
		} else {
			this.main_ctx = board_canvas.getContext('2d');
		}

		// --- load sound effects ---

		this.intro_audio = new Audio("sounds/pacman_beginning.wav");
		this.intro_audio.volume = 1;
		this.intro_audio.load();

		this.pallet_audio = new Audio("sounds/pacman_eatfruit.wav");
		this.pallet_audio.volume = 1;
		this.pallet_audio.load();

		// this.wakka_audio = new Audio("sounds/pacman_chomp.wav");
		// this.wakka_audio.loop = true;
		// this.wakka_audio.volume = 0.5;
		// this.wakka_audio.load();

		this.death_audio = new Audio("sounds/pacman_death.wav");
		this.death_audio.volume = 1;
		this.death_audio.load();

		this.eat_ghost_audio = new Audio("sounds/pacman_eatghost.wav");
		this.eat_ghost_audio.volume = 1;
		this.eat_ghost_audio.load();
	}

	restart() {
		document.getElementById('game-over').style.display = "none";
		score = 0;
		this.start();
	}

	start() {
		// --- clear prev game ---

		this.board_ctx.clearRect(0, 0, 1200, 800);
		this.main_ctx.clearRect(0, 0, 1200, 800);

		// --- recreate objects ---

		dots = new Array(CODE_MAP.length);
		dots_left = 0;
		game_mode = 'starting';
		power_rad = POWER_RADIUS_MIN;
		power_dir = 1;
		ghost_mode = 'hunting';

		this.pacman = new Pacman(this.main_ctx, 'P');
		this.ghosts = new Ghosts(this.main_ctx);

		// --- draw board ---

		if (this.board_ctx) {
			var map_h = CODE_MAP.length;
			for (var y = 0; y<map_h; y++) {
				var line = CODE_MAP[y];
				var color_line = HELPER_MAP[y];
				var map_w = line.length;
				dots[y] = new Array(map_w);
				for (var x = 0; x<map_w; x++) {
					var c = line[x];
					var color = color_line[x];

					drawCell(x, y, c, color, this.board_ctx)
					
					// remember stats as defined in the map
					if (c == '.' || c == '*') {
						dots[y][x] = c;
						dots_left++;
					}
				}
			}
		}

		// --- draw all actors ---

		this.pacman.draw();
		this.ghosts.draw();
	}

	tick() {
		switch (game_mode) {
			case 'starting':
				// this.wakka_audio.pause();

				if (this.intro_audio.currentTime == 0) {
					this.intro_audio.play();
				} else if (this.intro_audio.ended) {
					this.intro_audio.currentTime == 0;
					game_mode = 'playing';
					// this.wakka_audio.currentTime == 0;
					// this.wakka_audio.play();
				}
				break;

			case 'playing':

				// ugly hack: redraw the dots because bug
				var map_h = dots.length;
				for (var y = 0; y<map_h; y++) {
					var line = dots[y];
					var map_w = line.length;
					for (var x = 0; x<map_w; x++) {
						var c = line[x];
						
						if (c == '.' || c == '*') {
							drawCell(x, y, c, 0, this.board_ctx)
						}
					}
				}

				this.pacman.command();
				this.pacman.move();

				// --- ghosts ---

				this.ghosts.command(this.pacman);	// ghosts need to know where the pac is
				this.ghosts.move();

				// --- power pallets animation ---

				if (power_dir > 0) {
					power_rad += POWER_RAD_DELTA;
					if (power_rad > POWER_RADIUS_MAX) {
						power_dir = -POWER_RAD_DELTA;
					}
				} else {
					power_rad -= POWER_RAD_DELTA;
					if (power_rad < POWER_RADIUS_MIN) {
						power_dir = POWER_RAD_DELTA;
					}
				}

				// --- draw ---

				this.pacman.draw();
				this.ghosts.draw();

				document.getElementById('score').innerHTML = score;

				// --- handle ghost state ---

				if (ghost_mode == 'running') {
					ghost_running_counter--;
					if (ghost_running_counter == 0) {
						ghost_mode = 'hunting';
					}
				}

				// --- detect pac-ghost collision ---
				
				if (this.ghosts.isCollideWithPac(this.pacman)) {
					switch (ghost_mode) {
						case 'hunting':
							this.pacman.stop();
							this.ghosts.stop();
							game_mode = 'death';
							this.death_audio.play();
							break;

						case 'running':
							this.eat_ghost_audio.play();
							break;
					}
				}

				break;

			case 'death':
				// todo: start gameover sound
				if (this.pacman.deathAnim()) {
					game_mode = 'gameover';
					document.getElementById('game-over').style.display = "block";
					//this.gameOver();
				}
				break;

			case 'gameover':
				// this.wakka_audio.pause();
				// TODO
				break;

			default:
				console.log("### Unhandled game mode '" + game_mode + "'");
		}
	}

	powerMode() {
		this.pallet_audio.play();
		ghost_mode = 'running';
		ghost_running_counter = GHOST_RUNNING_TIME;
	}


	// // Game over
	// gameOver() {
	// 	// this.backgroundAudio.pause();
	// 	// this.gameOverAudio.currentTime = 0;
	// 	// this.gameOverAudio.play();
	// 	document.getElementById('game-over').style.display = "block";
	// };



}


// --- utility functions -------------------------

// scan the map to find an actor's starting position by its character
function findPosition(actor) {
	var map_h = CODE_MAP.length;
	for (var y = 0; y<map_h; y++) {
		var line = CODE_MAP[y];
		var map_w = line.length;
		for (var x = 0; x<map_w; x++) {
			var c = line[x];
			if (c == actor) {
				return [x, y];
			}
		}
	}
	return null;
}

function isWall(x, y, isBlocked) {
	var line = CODE_MAP[y];
	var c = line[x];
	for (var i=0, len=WALL_TILES.length; i<len; i++) {
		var w = WALL_TILES[i];
		if (c == w) {
			if (c == ':' && !isBlocked) {	// pac does not get blocked by ':' (invisible wall for ghosts)
				return false;
			} else {
				return true;
			}
		}
	}
	return false;
}

function isCollision(actor1, actor2) {
	return (rect1.x < rect2.x + rect2.width &&
		    rect1.x + rect1.width > rect2.x &&
		    rect1.y < rect2.y + rect2.height &&
		    rect1.height + rect1.y > rect2.y);
	    	// collision detected!
}


// --- draw functions ----------------------------

function drawCell(x, y, c, color, ctx) {
	var pos_x = BOARD_X + x*CELL_WIDTH;
	var pos_y = BOARD_Y + y*CELL_HEIGHT;
	var w = CELL_WIDTH;
	var h = CELL_HEIGHT;
	var center_x = pos_x + w/2;
	var center_y = pos_y + h/2;
	var radius = h/2;
	var dot_half = DOT_SIZE/2;
	var spacer2 = LINE_SPACER*2;

	// "A========B",
	// "I........H",
	// "I*a----b*H",
	// "I.|    |.H",
	// "I*d----c*H",
	// "I........H",
	// "D________C"

	// for debug
	// ctx.fillStyle = BACKGROUND_FILL_STYLE;		
	// ctx.fillRect(pos_x, pos_y, w-1, h-1);	
	
	ctx.lineWidth = LINE_WIDTH;
	var line_color = LINE_COLOR1;
	if (color == '2') {
		line_color = LINE_COLOR2;
	}

	switch (c)
	{
		case '-': 
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y);
			ctx.lineTo(pos_x + w, center_y);
			ctx.stroke();
			break;

		case '=': 
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y);
			ctx.lineTo(pos_x + w, center_y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y - LINE_SPACER);
			ctx.lineTo(pos_x + w, center_y - LINE_SPACER);
			ctx.stroke();
			break;

		case '_': 
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y);
			ctx.lineTo(pos_x + w, center_y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y + LINE_SPACER);
			ctx.lineTo(pos_x + w, center_y + LINE_SPACER);
			ctx.stroke();
			break;

		case '~': 	// gate center 
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y);
			ctx.lineTo(pos_x + w, center_y);
			ctx.stroke();
			break;

		case '>': 	// gate left
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			ctx.moveTo(center_x, center_y);
			ctx.lineTo(center_x + w/2, center_y);
			ctx.stroke();

			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y);
			ctx.lineTo(center_x, center_y);
			ctx.lineTo(center_x, center_y + LINE_SPACER);
			ctx.lineTo(pos_x, center_y + LINE_SPACER);
			ctx.stroke();
			break;

		case '<': 	// gate right
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			ctx.moveTo(pos_x, center_y);
			ctx.lineTo(center_x, center_y);
			ctx.stroke();

			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(pos_x + w, center_y);
			ctx.lineTo(center_x, center_y);
			ctx.lineTo(center_x, center_y + LINE_SPACER);
			ctx.lineTo(pos_x + w, center_y + LINE_SPACER);
			ctx.stroke();
			break;


		case '|': 
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.lineTo(center_x, pos_y + h);
			ctx.stroke();
			break;

		case 'I': 
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.lineTo(center_x, pos_y + h);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x - LINE_SPACER, pos_y);
			ctx.lineTo(center_x - LINE_SPACER, pos_y + h);
			ctx.stroke();
			break;

		case 'H': 
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.lineTo(center_x, pos_y + h);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x + LINE_SPACER, pos_y);
			ctx.lineTo(center_x + LINE_SPACER, pos_y + h);
			ctx.stroke();
			break;

		case 'a': 				// arc top left
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y+h);
			ctx.arcTo(center_x, pos_y+radius, pos_x + w, center_y, radius);
			ctx.stroke();
			break;

		case 'A': 				// double arc top left
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y+h);
			ctx.arcTo(center_x, pos_y+radius,
				pos_x + w, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x - LINE_SPACER, pos_y+h);
			ctx.arcTo(center_x - LINE_SPACER, pos_y+radius - LINE_SPACER,
				pos_x + w - LINE_SPACER, center_y - LINE_SPACER, radius + LINE_SPACER);
			ctx.stroke();
			break;

		case 'W': 				// inner double arc top left
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y+h);
			ctx.arcTo(center_x, pos_y+radius,
				pos_x + w, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x + LINE_SPACER, pos_y+h);
			ctx.arcTo(center_x + LINE_SPACER, pos_y+radius + LINE_SPACER,
				pos_x + w + LINE_SPACER, center_y + LINE_SPACER, radius - LINE_SPACER);
			ctx.stroke();
			break;

		case 'b': 				// arc top right
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y+h);
			ctx.arcTo(center_x, pos_y+radius, pos_x, center_y, radius);
			ctx.stroke();
			break;

		case 'B': 				// double arc top right
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y+h);
			ctx.arcTo(center_x, pos_y+radius, pos_x, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x + LINE_SPACER, pos_y+h);
			ctx.arcTo(center_x + LINE_SPACER, pos_y+radius - LINE_SPACER,
				pos_x, center_y - LINE_SPACER, radius + LINE_SPACER);
			ctx.stroke();
			break;

		case 'X': 				// inner double arc top right
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y+h);
			ctx.arcTo(center_x, pos_y+radius, pos_x, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x - LINE_SPACER, pos_y+h);
			ctx.arcTo(center_x - LINE_SPACER, pos_y+radius + LINE_SPACER,
				pos_x, center_y + LINE_SPACER, radius - LINE_SPACER);
			ctx.stroke();
			break;

		case 'c': 				// arc bottom right
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.arcTo(center_x, pos_y+h-radius, pos_x, center_y, radius);
			ctx.stroke();
			break;

		case 'C': 				// double arc bottom right
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.arcTo(center_x, pos_y+h-radius, pos_x, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x + LINE_SPACER, pos_y);
			ctx.arcTo(center_x + LINE_SPACER, pos_y+h-radius + LINE_SPACER,
				pos_x, center_y + LINE_SPACER, radius + LINE_SPACER);
			ctx.stroke();
			break;

		case 'Y': 				// inner double arc bottom right
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.arcTo(center_x, pos_y+h-radius, pos_x, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x - LINE_SPACER, pos_y);
			ctx.arcTo(center_x - LINE_SPACER, pos_y+h-radius - LINE_SPACER,
				pos_x, center_y - LINE_SPACER, radius - LINE_SPACER);
			ctx.stroke();
			break;

		case 'd': 				// arc bottom left
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.arcTo(center_x, pos_y+h-radius, pos_x + w, center_y, radius);
			ctx.stroke();
			break;

		case 'D': 				// double arc bottom left
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.arcTo(center_x, pos_y+h-radius, pos_x + w, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x - LINE_SPACER, pos_y);
			ctx.arcTo(center_x - LINE_SPACER, pos_y+h-radius + LINE_SPACER,
				pos_x + w, center_y + LINE_SPACER, radius + LINE_SPACER);
			ctx.stroke();
			break;

		case 'Z': 				// inner double arc bottom left
			ctx.strokeStyle = line_color;
			ctx.beginPath();
			ctx.moveTo(center_x, pos_y);
			ctx.arcTo(center_x, pos_y+h-radius, pos_x + w, center_y, radius);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(center_x + LINE_SPACER, pos_y);
			ctx.arcTo(center_x + LINE_SPACER, pos_y+h-radius - LINE_SPACER,
				pos_x + w, center_y - LINE_SPACER, radius - LINE_SPACER);
			ctx.stroke();
			break;

		case '.': 				// dot
			ctx.fillStyle = DOT_COLOR;
			ctx.fillRect(center_x - dot_half, center_y - dot_half, DOT_SIZE, DOT_SIZE);	
			break;

		case '*': 				// power pallet
			ctx.clearRect(center_x - POWER_RADIUS_MAX, center_y - POWER_RADIUS_MAX, POWER_RADIUS_MAX*2, POWER_RADIUS_MAX*2);

			ctx.fillStyle = POWER_COLOR;
			ctx.beginPath();
			ctx.arc(center_x, center_y, power_rad, 0, 6.3);
			ctx.fill();
			break;

		// those will be drawn by their objects - the map just defines the starting position
		case 'P': 	// pacman
		case '1': 	// ghost 1
		case '2': 	// ghost 2
		case '3': 	// ghost 3
		case '4': 	// ghost 4
		case ' ':  	// empty space
		case ':':  	// empty space
			break;

		default: 
			console.log("unhandled item in CODE_MAP: '" + c + "'")
			break;
	}	
}

function eatDot(x, y, ctx) {
	// console.log("dot at " + x + "," + y);

	dots[y][x] = null;
	score += 10;
	dots_left--;

	if (dots_left == 0) {
		game.start();
	}
	var pos_x = BOARD_X + x*CELL_WIDTH;
	var pos_y = BOARD_Y + y*CELL_HEIGHT;
	var w = CELL_WIDTH;
	var h = CELL_HEIGHT;
	var center_x = pos_x + w/2;
	var center_y = pos_y + h/2;
	var dot_half = DOT_SIZE/2;
	
	ctx.fillStyle = 'black';
	ctx.fillRect(center_x - dot_half, center_y - dot_half, DOT_SIZE, DOT_SIZE);	

	// console.log(dots[y]);
	// console.log("left: " + dots_left)
	// console.log("------------------------------------------");
	var a = 0;
}

function eatPallet(x, y, ctx) {
	// console.log("dot at " + x + "," + y);

	dots[y][x] = null;
	score += 50;
	dots_left--;

	game.powerMode();

	if (dots_left == 0) {
		game.start();
	}
	var pos_x = BOARD_X + x*CELL_WIDTH;
	var pos_y = BOARD_Y + y*CELL_HEIGHT;
	var w = CELL_WIDTH;
	var h = CELL_HEIGHT;
	var center_x = pos_x + w/2;
	var center_y = pos_y + h/2;
	var dot_half = DOT_SIZE/2;
	
	ctx.fillStyle = 'black';
	ctx.fillRect(center_x - dot_half, center_y - dot_half, DOT_SIZE, DOT_SIZE);	

	// console.log(dots[y]);
	// console.log("left: " + dots_left)
	// console.log("------------------------------------------");
	var a = 0;
}

// var lookupTable = {
// 	"right": function() {
// 		ctx.strokeStyle = LINE_COLOR;
// 		ctx.beginPath();
// 		ctx.moveTo(pos_x, center_y);
// 		ctx.lineTo(pos_x + w, center_y);
// 		ctx.stroke();
// 	},

// 	"down": function() {
// 		return "building";
// 	},

// 	"doubleRight": function() {
// 		return "nothing";
// 	}
// };

// --- keyboard input -----------------------------------------------------

// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

// Creates the array to hold the KEY_CODES and sets all their values
// to true. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
	// Firefox and opera use charCode instead of keyCode to
	// return which key was pressed.
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
		e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}

// --- animation engine ---------------------------------------------------

/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	game.tick();
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

// --- start --------------------------------------------------------------

var game = new Game();

game.start();
animate();
