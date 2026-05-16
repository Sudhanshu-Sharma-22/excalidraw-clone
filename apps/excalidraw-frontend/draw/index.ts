
export function initCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
        console.log(startX, startY)
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;

    })

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            ctx.strokeStyle = 'blue'
            ctx.lineWidth = 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeRect(startX, startY, width, height)
        }
    })
}