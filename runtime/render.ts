const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;


const black = '#000000'

const ZXcolors = {
  'red': 'rgba(232, 165, 165, 0.66)',
  'green': 'rgba(216, 248, 216, 0.66)',
  'white': 'rgba(255, 255, 255, 0)',
}

interface ZXNode {
  color: 'red' | 'green' | 'white',
  rotation: string,
  nIn: string,
  nOut: string
}


function baseStyle() {
  context.fillStyle = black;
  context.strokeStyle = black;
  context.textBaseline = 'middle';
  context.textAlign = "center";
  context.font = "15px Arial";
}


function keepContext(context: CanvasRenderingContext2D, drawFn: () => any) {
  context.save()
  drawFn();
  context.restore()
}

const xpad = 10
const ypad = 10
const widthStack = 100

const xtextpad = 2
const ytextpad = 4

function isDigit(unicode: number) {
  return (unicode >= 48 && unicode <= 57);
}

const unicodeSubscriptOffset = 8272;

function isSubscriptDigit(unicode: number) {
  return (unicode >= 48 + unicodeSubscriptOffset && unicode <= 57 + unicodeSubscriptOffset);
}

function nonLastDigitLength(input: string): number {
  if (new RegExp("^[0-9]+$").test(input)) {
    return input.length;
  }
  let finalDigits = 0
  for (let i = input.length - 1; i >= 0; i--) {
    if (!(isDigit(input.charCodeAt(i)) || isSubscriptDigit(input.charCodeAt(i)))) {
      break;
    }
    finalDigits++;
  }
  return input.length - finalDigits;

}


function createZXNode(node: ZXNode, x: number, y: number, width: number, height: number) {
  baseStyle()
  keepContext(context, () => {
    context.setLineDash([6]);
    context.fillStyle = ZXcolors[node.color];
    context.strokeRect(x - width / 2, y - height / 2, width, height);
    context.fillRect((x - width / 2) + 1, (y - height / 2) + 1, width - 2, height - 2);
    context.strokeStyle = black;
  });
  keepContext(context, () => {
    context.font = "30px Fira Code";
    context.fillText(node.rotation, x, y, width - (xpad * 2))
  });
  keepContext(context, () => {
    context.font = "15px Fire Code";
    context.translate(x - width / 2 + 1, y)
    if (nonLastDigitLength(node.nIn) > 1 || node.nIn.length > 4) {
      context.textBaseline = "top";
      context.rotate(-Math.PI / 2);
    } else {
      context.translate(xtextpad, 0);
      context.textAlign = "left";
    }
    context.fillText(node.nIn, 0, 0, height - 2 * ytextpad)
  })
  keepContext(context, () => {
    context.font = "15px Fire Code";
    context.translate(x + width / 2 - 1, y)
    if (nonLastDigitLength(node.nOut) > 1 || node.nOut.length > 4) {
      context.textBaseline = "top";
      context.rotate(Math.PI / 2);
    } else {
      context.translate(-xtextpad, 0);
      context.textAlign = "right";
    }
    context.fillText(node.nOut, 0, 0, height - 2 * ytextpad)
  })
}

function createCompose(x0: number, x1: number, y: number, width0: number, width1: number, height01: number) {
  const xcenter = (x0 + x1) / 2
  const width = width0 + width1 + xpad * 4
  const height = height01 + ypad * 2
  keepContext(context, () => {
    context.setLineDash([6]);
    context.strokeRect(xcenter - width / 2, y - height / 2, width, height);
  });
}

function createStack(x: number, y0: number, y1: number, width01: number, height0: number, height1: number) {
  const ycenter = (y0 + y1) / 2
  const height = height0 + height1 + ypad * 4
  const width = width01 + xpad * 2
  keepContext(context, () => {
    context.setLineDash([6]);
    context.strokeRect(x - width / 2, ycenter - height / 2, width, height);
  });
}

function createCast(nIn: string, nOut: string, x: number, y: number, baseWidth: number, baseHeight: number) {
  const height = baseHeight + ypad * 4 + 15
  const width = baseWidth + 15 * 2 + xpad * 2
  keepContext(context, () => {
    context.setLineDash([6]);
    context.strokeRect(x - width / 2, y - height / 2 - 7.5 - ypad, width, height);
  });
  keepContext(context, () => {
    context.font = "30px Fire Code";
    context.translate(x, y - height / 2 + ypad)
    context.fillText("Cast", 0, 0)

  })
  keepContext(context, () => {
    context.font = "15px Fire Code";
    context.translate(x - width / 2, y)
    if (nonLastDigitLength(nIn) > 1 || nIn.length > 4) {
      context.textBaseline = "top";
      context.translate(xtextpad, 0);
      context.rotate(-Math.PI / 2);
    } else {
      context.translate(xtextpad, 0);
      context.textAlign = "left";
    }
    context.fillText(nIn, 0, 0, height - 2 * ytextpad)
  })
  keepContext(context, () => {
    context.font = "15px Fire Code";
    context.translate(x + width / 2 - 1, y)
    if (nonLastDigitLength(nOut) > 1 || nOut.length > 4) {
      context.textBaseline = "top";
      context.rotate(Math.PI / 2);
    } else {
      context.translate(-xtextpad, 0);
      context.textAlign = "right";
    }
    context.fillText(nOut, 0, 0, height - 2 * ytextpad)
  })

}

function createNStackArb(n: string, x: number, y: number, baseWidth: number, baseHeight: number) {
  const height = baseHeight + ypad * 2
  const width = baseWidth + xpad * 2 + widthStack
  keepContext(context, () => {
    context.setLineDash([6]);
    context.strokeRect(x - (baseWidth / 2 + xpad + widthStack), y - height / 2, width, height);
  });
  keepContext(context, () => {
    context.font = "45px Fire Code";
    context.translate(x - (baseWidth / 2 + xpad + widthStack * 2 / 3) + 1, y)
    if (nonLastDigitLength(n) > 1 || n.length > 3) {
      context.font = "20px Fire Code";
      context.textBaseline = "middle";
      context.rotate(-Math.PI / 2);
    } else {
      context.translate(xtextpad, 0);
      context.textAlign = "center";
    }
    context.fillText(n, 0, 0, height - 2 * ytextpad)

  })
  keepContext(context, () => {
    context.font = "45px Fire Code";
    context.translate(x - (baseWidth / 2 + xpad + widthStack * 1 / 3) + 1 + 2 * xtextpad, y)
    context.translate(xtextpad, 0);
    context.textAlign = "left";
    context.fillText("↑", 0, 0, height - 2 * ytextpad)

  })
}

function drawNode(node) {
  context.fillStyle = node.fillStyle;
  context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
  context.strokeStyle = node.strokeStyle;
  context.stroke();
  context.fill();
}

// Idea: Store all commands sent from extension and then render as needed
let commands: string[] = []

function render() {
  for (let command in commands) {
    eval(command)
  }
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render()
}

function clear() {
  commands = []
  context.clearRect(0, 0, canvas.width, canvas.height);
}

window.onresize = resize;
resize();


function handleMessage(this: Window, msg: MessageEvent<any>) {
  const command = msg.data.command as string
  if (command.startsWith("create")) {
    commands.push(command)
    eval(command)
  } else if (command === 'clear') {
    clear()
  } else {
    console.log(`Recieved invalid commannd "${command}"`)
  }
}

window.addEventListener('message', handleMessage)