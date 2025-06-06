const canvas = document.querySelector('#gameCanvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')

// Remove these lines that set canvas to window size
// canvas.width = innerWidth
// canvas.height = innerHeight

// Add this function to handle canvas sizing
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Call resize on load
resizeCanvas();

// Add event listener for window resize
window.addEventListener('resize', resizeCanvas);

class Boundary{
    static width = 40
    static height= 40
    constructor({position,image}) {

        this.position = position
        this.width = 40
        this.height  = 40
        this.image = image
    }

    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}


 
class Player {
    constructor({position, velocity} ) {
        this.position =   position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openrate = 0.12
        this.rotation = 0
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc( this.position.x, this.position.y, this.radius, this.radians , Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x +=this.velocity.x
        this.position.y +=this.velocity.y

        if (this.radians < 0 || this.radians > .75)
          this.openrate = -this.openrate

        this.radians +=this.openrate
    }
}

class Ghost {
  static speed = 2
  constructor({position, velocity,color='red'} ) {
      this.position =   position
      this.velocity = velocity
      this.radius = 15
      this.color = color
      this.prevCollisions = []
      this.speed = 2
      this.scared = false
  }

  draw() {
      c.beginPath()
      c.arc( this.position.x, this.position.y, this.radius, 0 , Math.PI * 2)
      c.fillStyle = this.scared ? 'blue' : this.color
      c.fill()
      c.closePath()
  }

  update() {
      this.draw()
      this.position.x +=this.velocity.x
      this.position.y +=this.velocity.y
  }
}

class Pellet {
  constructor({position} ) {
      this.position =   position
    
      this.radius = 3
  }

  draw() {
      c.beginPath()
      c.arc( this.position.x, this.position.y, this.radius, 0 , Math.PI * 2)
      c.fillStyle = 'white'
      c.fill()
      c.closePath()
  }


}


class PowerUp {
  constructor({position} ) {
      this.position =   position
      this.radius = 8
  }

  draw() {
      c.beginPath()
      c.arc( this.position.x, this.position.y, this.radius, 0 , Math.PI * 2)
      c.fillStyle = 'white'
      c.fill()
      c.closePath()
  }


}

const pellets = []
const boundaries = []
const powerUps = []
const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width /2,
      y: Boundary.height + Boundary.height /2
    },
    velocity: {
      x: Ghost.speed,
      y: 0 
    }
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width /2,
      y: Boundary.height  + Boundary.height /2
    },
    velocity: {
      x: Ghost.speed ,
      y: 0
    },
    color : 'pink'
  }),
  new Ghost({
    position: {
      x: Boundary.width * 17 + Boundary.width /2,
      y: Boundary.height * 11 + Boundary.height /2
    },
    velocity: {
      x: 0,
      y: -Ghost.speed 
    },
    color : 'green'
  }),
  new Ghost({
    position: {
      x: Boundary.width * 12 + Boundary.width /2,
      y: Boundary.height + Boundary.height /2
    },
    velocity: {
      x: -Ghost.speed,
      y: 0 
    },
    color : 'orange'
  })

]
const player = new Player({
    position: {
        x: Boundary.width * 9  + Boundary.width /2,
        y: Boundary.height * 6 + Boundary.height /2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },    
    s: {
        pressed: false
    },    
    d: {
        pressed: false
    }
    
}

let lastKey = ''

let score = 0 


const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
  ]


  function createImage(src){
    const image = new Image()
    image.src = src
    return image
  }
  
  // Additional cases (does not include the power up pellet that's inserted later in the vid)
  map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '-':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeHorizontal.png')
            })
          )
          break
        case '|':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeVertical.png')
            })
          )
          break
        case '1':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner1.png')
            })
          )
          break
        case '2':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner2.png')
            })
          )
          break
        case '3':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner3.png')
            })
          )
          break
        case '4':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner4.png')
            })
          )
          break
        case 'b':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/block.png')
            })
          )
          break
        case '[':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capLeft.png')
            })
          )
          break
        case ']':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capRight.png')
            })
          )
          break
        case '_':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capBottom.png')
            })
          )
          break
        case '^':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capTop.png')
            })
          )
          break
        case '+':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/pipeCross.png')
            })
          )
          break
        case '5':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./img/pipeConnectorTop.png')
            })
          )
          break
        case '6':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./img/pipeConnectorRight.png')
            })
          )
          break
        case '7':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./img/pipeConnectorBottom.png')
            })
          )
          break
        case '8':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/pipeConnectorLeft.png')
            })
          )
          break
        case '.':
          pellets.push(
            new Pellet({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              }
            })
          )
          break
        case 'p':
          powerUps.push(
            new PowerUp({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              }
            })
          )
          break
      }
    })
  })

function collids({
    circle,
    rectangle
}) {

  const padding = Boundary.width / 2 - circle.radius - 1
    return(
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
    )
}


let animationId

function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0,0,canvas.width, canvas.height)


    //Detect collisions between ghost and player
    for(let i = ghosts.length -1; 0<=i; i--) {
      const ghost = ghosts[i]
        if (Math.hypot(
          ghost.position.x - player.position.x,
          ghost.position.y - player.position.y
        ) < 
          ghost.radius + player.radius )
        {
          if( ghost.scared ) {
            ghosts.splice(i,1)
            score+=100
            scoreEl.innerHTML = score
            // ghosts.push()
            // How to respawn the ghost

          }
          else {
          cancelAnimationFrame(animationId)
          console.log('you lose')
          }

        }
    }

    //win condition goes
    if( pellets.length === 0){
      console.log('you win')
        cancelAnimationFrame(animationId)
    }

    //touch powerups there
    for(let i = powerUps.length -1; 0<=i; i--) {
      const powerUp = powerUps[i]
      powerUp.draw()





      //player collides with power up 
      //ghost scared
      if (Math.hypot(powerUp.position.x-player.position.x,
        powerUp.position.y - player.position.y
      ) < powerUp.radius + player.radius)
      {
        console.log('touching powerup')
        powerUps.splice(i,1)

        //make ghost scared
        ghosts.forEach(ghost => {
          ghost.scared = true
          console.log(ghost.scared)

          setTimeout(() => {
            ghost.scared = false
            console.log(ghost.scared)
          },5000)
        }
        )
        // score+=100
        // scoreEl.innerHTML = score
      }
    }


    //Drawing a backwards loop
    //touch pellet here
    for(let i= pellets.length - 1; 0<i; i--){
      const pellet = pellets[i]

      pellet.draw()

      if (Math.hypot(pellet.position.x-player.position.x,
        pellet.position.y - player.position.y
      ) < pellet.radius + player.radius)
      {
        console.log('touching')
        pellets.splice(i,1)
        score+=10
        scoreEl.innerHTML = score
      }


    }
 


    boundaries.forEach((boundary) => {
        boundary.draw()


        if (collids({
            circle:player,
            rectangle: boundary
        })
        )
            {
                console.log('we are colliding')
                player.velocity.x = 0
                player.velocity.y = 0
            }
    })


    player.update()
    // player.velocity.x = 0
    // player.velocity.y = 0
    


    //ghost touches here
    ghosts.forEach((ghost) => {
      ghost.update()



      const collisions = []
      boundaries.forEach(boundary => {

        if (!collisions.includes('right') && 
        collids({
          circle: {
            ...ghost, velocity: {
              x: ghost.speed,
              y: 0
          }},
          rectangle: boundary
          })
        ) {

          collisions.push('right')
        }


        if (!collisions.includes('left') && 
          collids({
          circle: {
            ...ghost, velocity: {
              x: -ghost.speed,
              y: 0
          }},
          rectangle: boundary
          })
        ) {

          collisions.push('left')
        }

        if (!collisions.includes('down') && 
          collids({
          circle: {
            ...ghost, velocity: {
              x: 0,
              y: ghost.speed
          }},
          rectangle: boundary
          })
        ) {

          collisions.push('down')
        }

        if (!collisions.includes('up') && 
          collids({
          circle: {
            ...ghost, velocity: {
              x: 0,
              y: -ghost.speed
          }},
          rectangle: boundary
          })
        ) {

          collisions.push('up')
        }
      })
      if (collisions.length > ghost.prevCollisions.length)
        ghost.prevCollisions = collisions

      if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
   
      if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')
      

      const pathways = ghost.prevCollisions.filter((collision) => {
          return !collisions.includes(collision)
        })
      console.log({pathways})


      const direction = pathways[Math.floor(Math.random() * pathways.length)]

      console.log({direction})

      switch (direction) {
        case 'down':
          ghost.velocity.y = ghost.speed
          ghost.velocity.x = 0
          break
        case 'up':
          ghost.velocity.y = -ghost.speed
          ghost.velocity.x = 0
          break        
        case 'right':
          ghost.velocity.y = 0
          ghost.velocity.x = ghost.speed
          break        
        case 'left':
          ghost.velocity.y = 0
          ghost.velocity.x = -ghost.speed
          break        
      }

      ghost.prevCollisions = []



      }
      // console.log(collisions)

    })
  


    if (keys.w.pressed && lastKey==='w') {
       for(let i=0; i < boundaries.length; i++){
        const boundary = boundaries[i]
            if (collids({
                    circle: {...player, velocity: {
                        x: 0,
                        y: -5
                    }},
                    rectangle: boundary
                })
            ) {
                    player.velocity.y = 0
                    break

                }
                else{
                    player.velocity.y =-5
                }
        }
    }else if(keys.a.pressed && lastKey==='a' ) {
        for(let i=0; i < boundaries.length; i++){
            const boundary = boundaries[i]
                if (collids({
                        circle: {...player, velocity: {
                            x: -5,
                            y: 0
                        }},
                        rectangle: boundary
                    })
                ) {
                        player.velocity.x = 0
                        break
    
                    }
                    else{
                        player.velocity.x = -5
                    }
            }
        
    
    }else if(keys.s.pressed && lastKey==='s') {
        for(let i=0; i < boundaries.length; i++){
            const boundary = boundaries[i]
                if (collids({
                        circle: {...player, velocity: {
                            x: 0,
                            y: 5
                        }},
                        rectangle: boundary
                    })
                ) {
                        player.velocity.y = 0
                        break
    
                    }
                    else{
                        player.velocity.y =5
                    }
            }

    }else if(keys.d.pressed && lastKey==='d') {
        for(let i=0; i < boundaries.length; i++){
            const boundary = boundaries[i]
                if (collids({
                        circle: {...player, velocity: {
                            x: 5,
                            y: 0
                        }},
                        rectangle: boundary
                    })
                ) {
                        player.velocity.x = 0
                        break
    
                    }
                    else{
                        player.velocity.x = 5
                    }
            }
    }


    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5


} 


animate()





addEventListener('keydown', ({key}) => {

    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break

        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
 


})

addEventListener('keyup', ({key}) => {

    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    } 

}) 

