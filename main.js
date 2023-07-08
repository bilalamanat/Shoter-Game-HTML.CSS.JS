let $ = e => document.querySelector(e)
    let ran = n => Math.random() * n;
    let c = can.getContext('2d')
    can.width = innerWidth;
    can.height = innerHeight;
    let w = can.width,
      h = can.height;

    class Player {
      constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.score = 0
      }

      draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill()
      }
    }

    class Projectile extends Player {
      constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color)
        this.velocity = velocity;
      }

      update() {
        this.draw()
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      }
    }

    class Enemy extends Projectile {
      constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
      }
    }


    class Particle extends Projectile {
      constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
        this.alpha = 1
      }

      draw() {
        c.save()
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill()
        c.restore()
      }

      update() {
        this.draw()
        this.x += this.velocity.x * 0.99;
        this.y += this.velocity.y;
        this.alpha -= .01
      }
    }

    let player = new Player(can.width / 2, can.height / 2, 40, 'white');
    player.draw()


    let projectiles = [];
    let enemies = [];
    let particles = [];


    let createEnemy = setInterval(() => {
      let radius = Math.random() * (30 - 4) + 5,
        x = Math.random() < 0.5 ? -radius : w + radius,
        y = Math.random() * h - radius,
        color = `hsl( ${ Math.random() * 120 } , 90% , 50% )`,
        angle = Math.atan2(h / 2 - y, w / 2 - x)
      velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }
      enemies.push(new Enemy(x, y, radius, color, velocity))

      // enemiesSpeed <= 100 ? enemiesSpeed = 100 : enemiesSpeed-=100
    }, 500);



    let loop;

    function animate() {
      loop = requestAnimationFrame(animate);
      c.fillStyle = 'rgba(0,0,0, .1)';
      c.fillRect(0, 0, w, h)
      player.draw()

      particles.forEach((par, ind) => {
        if (par.alpha <= 0) {
          particles.splice(ind, 1)
        } else {
          par.update()
        }
      })

      // if projectile touch screen
      projectiles.forEach((p, i) => {
        p.update();
        if (Math.floor(p.x) == 0 ||
          Math.floor(p.x) == w ||
          Math.floor(p.y) == 0 ||
          Math.floor(p.y) == h) {

          projectiles.splice(i, 1);
        }

      });

      enemies.forEach((e, eInd) => {
        e.update();

        let dist = Math.hypot(Math.floor(player.x - e.x, player.y - e.x));
        if (dist - e.radius - player.radius / 2 < 1) {
          cancelAnimationFrame(loop)
          location.reload()
        }

        // crushing on enemy
        projectiles.forEach((p, pInd) => {
          let dist = Math.hypot(p.x - e.x, p.y - e.y);

          if (dist - e.radius - p.radius < 1) {

            if (e.radius - 10 > 10) {
              e.radius -= 10;
            } else {
              enemies.splice(eInd, 1);
              projectiles.splice(pInd, 1);
              player.score++;
              $('.score span').innerHTML = player.score;
            }
            for (i = 0; i < 20; i++) {
              particles.push(new Particle(p.x, p.y, 1, e.color, { x: Math.random() - .5, y: Math.random() - .5 }));
            }
          }
        })
      });
    }

    addEventListener('click', (e) => {

      let angle = Math.atan2(e.clientY - h / 2, e.clientX - w / 2)
      let velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
      }

      projectiles.push(new Projectile(w / 2, h / 2, 5, 'white', velocity))

    });

    animate();

    //____________________

    let pause = false;
    $('.pause').addEventListener('click', () => {
      pause = !pause;
      pause ? cancelAnimationFrame(loop) : requestAnimationFrame(animate);
    });

    let destroy = 3;
    $('.destroy').addEventListener('click', () => {
      destroy--;
      if (destroy >= 0) {
        $('.destroy').innerHTML = destroy  ;
        for (i = 0; i < 6.28; i += 0.1) {
          let velocity = {
            x: Math.cos(i) * 5,
            y: Math.sin(i) * 5
          }
          projectiles.push(new Projectile(w / 2, h / 2, 5, 'orangered', velocity))
        }
      }
    });
