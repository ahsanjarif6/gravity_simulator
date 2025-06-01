const canvas = document.getElementById('space');

const ctx = canvas.getContext("2d");

let bodies = []
const G = 1
const dt = 1
let draggedBody = null
let isDragging = false

class Body{
    
    constructor(x,y,vx,vy,mass,radius,color){
        this.x=x
        this.y=y
        this.vx=vx
        this.vy=vy
        this.mass=mass
        this.radius=radius
        this.color=color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    updateForce(otherBodies) {
        let ax = 0, ay = 0
        for (const body of otherBodies) {
            if (body === this) continue
            let dx = body.x - this.x
            let dy = body.y - this.y
            let dist = dx * dx + dy * dy
            dist = Math.sqrt(dist)
            let force = G * body.mass / (dist * dist)
            ax += force * dx / dist
            ay += force * dy / dist
        }
        this.vx += ax * dt
        this.vy += ay * dt
    }

    updatePosition() {
        this.x += this.vx * dt
        this.y += this.vy * dt
        if(this.x-this.radius < 0){
            this.vx *= -1
            this.updatePosition()
        }
        else if(this.x+this.radius >= canvas.width){
            this.vx *= -1
            this.updatePosition()
        }
        if(this.y-this.radius < 0){
            this.vy *= -1
            this.updatePosition()
        }
        else if(this.y+this.radius >= canvas.height){
            this.vy *= -1
            this.updatePosition()
        }
    }
}

document.getElementById('startBtn').addEventListener('click',()=>{
    const numOfBodies = parseInt(document.getElementById('numBodies').value , 10)
    startSimulation(numOfBodies)
})

function randomRange(min,max){
    return (max-min)*Math.random() + min
}

function reflectVelocities(bodyA, bodyB) {
    const dx = bodyB.x - bodyA.x
    const dy = bodyB.y - bodyA.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    const nx = dx / dist
    const ny = dy / dist

    const vaDotN = bodyA.vx * nx + bodyA.vy * ny
    const vbDotN = bodyB.vx * nx + bodyB.vy * ny

    bodyA.vx = bodyA.vx - 2 * vaDotN * nx
    bodyA.vy = bodyA.vy - 2 * vaDotN * ny

    bodyB.vx = bodyB.vx - 2 * vbDotN * nx
    bodyB.vy = bodyB.vy - 2 * vbDotN * ny
}

function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const body of bodies) {
        body.updateForce(bodies)
    }

    for (const body of bodies) {
        body.updatePosition()
    }

    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i]
            const b = bodies[j]
    
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.sqrt(dx * dx + dy * dy)
    
            if (dist < a.radius + b.radius) {
                reflectVelocities(a, b)
            }
        }
    }
    
    for(const body of bodies){
        body.updatePosition()
        body.draw()
    }

    requestAnimationFrame(update)
}

function startSimulation(numBodies){
    bodies.length = 0
    
    for(let i = 0 ; i < numBodies ; i ++ ){
        const r = randomRange(10,20)
        bodies.push(new Body(
            randomRange(r,canvas.width-r),
            randomRange(r,canvas.height-r),
            randomRange(-0.7,0.7),
            randomRange(-0.7,0.7),
            randomRange(50,60),
            r,
            `hsl(${Math.random() * 360}, 100%, 50%)`
        ))
    }

    requestAnimationFrame(update)
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    for (const body of bodies) {
        const dx = body.x - mx
        const dy = body.y - my
        if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
            draggedBody = body
            isDragging = true
            break
        }
    }
})

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedBody) {
        const rect = canvas.getBoundingClientRect()
        let mx = e.clientX - rect.left
        let my = e.clientY - rect.top

        mx = Math.max(draggedBody.radius,Math.min(canvas.width-draggedBody.radius,mx))
        my = Math.max(draggedBody.radius,Math.min(canvas.height-draggedBody.radius,my))

        draggedBody.x = mx
        draggedBody.y = my
    }
})

window.addEventListener('mouseup', () => {
    isDragging = false
    draggedBody = null
})

