import * as ast from '../parsing/ast';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TEXT_PAD_SIZE, cap, cup, box, wire, swap, empty } from '../constants/consts';
import { findCenter, findLeftCenter, findRightCenter } from '../parsing/coords';

const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
// // colors
const white = '#FFFFFF';
const black = '#000000';
const red = '#FFA4A4';
const green = '#A4FFA4';
// just for testing
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas_format();

function drawBaseNode(node: ast.ASTNode) {
    ctx.fillStyle = white;
    ctx.strokeStyle = black;
    let inputs: string;
    let outputs: string;
    let alpha: string;
    switch (node.kind) {
        case 'spider': {
            let spider = <ast.ASTSpider>node;
            if (spider.val === 'Z') {
                ctx.fillStyle = green;
            }
            if (spider.val ==='X') {
                ctx.fillStyle = red;
            }
            inputs = spider.in.val;
            outputs = spider.out.val;
            alpha = spider.alpha.val;
            break;
        }
        case 'const': {
            ctx.fillStyle = white;
            let zxconst = <ast.ASTConst>node;
            switch (zxconst.val) {
                case ast.ZXConst.Wire: {
                    inputs = '1';
                    outputs = '1';
                    alpha = wire;
                    break;
                }
                case ast.ZXConst.Box: {
                    inputs = '1';
                    outputs = '1';
                    alpha = box;
                    break;
                }
                case ast.ZXConst.Cap: {
                    inputs = '0';
                    outputs = '2';
                    alpha = cap;
                    break;
                }
                case ast.ZXConst.Cup: {
                    inputs = '2';
                    outputs = '0';
                    alpha = cup;
                    break;
                }
                case ast.ZXConst.Empty: {
                    inputs = '0';
                    outputs = '0';
                    alpha = empty;
                    break;
                }
                case ast.ZXConst.Swap: {
                    inputs = '2';
                    outputs = '2';
                    alpha = swap;
                    break;
                }
                default: {
                    throw new Error(`unknown const ${node} in drawBaseNode`);
                }
            }
            break;
        }
        default: {
            throw new Error(`unknown base node ${node} in drawBaseNode`);
        }
    }
    ctx.beginPath();
    ctx.moveTo(node.boundary!.tl.x, node.boundary!.tl.y);
    ctx.lineTo(node.boundary!.tr.x, node.boundary!.tr.y);
    ctx.lineTo(node.boundary!.br.x, node.boundary!.br.y);
    ctx.lineTo(node.boundary!.bl.x, node.boundary!.bl.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    let center = findCenter(node.boundary!);
    let left = findLeftCenter(node.boundary!);
    let right = findRightCenter(node.boundary!);
    text_format('spider_alpha');
    ctx.strokeText(alpha, center.x, center.y);
    text_format('spider_in_out');
    ctx.fillText(outputs, right.x - TEXT_PAD_SIZE, right.y);
    ctx.fillText(inputs, left.x + TEXT_PAD_SIZE, left.y);

}

function text_format(loc: string) {
    switch(loc) {
        case 'spider_in_out': {
            ctx.font = "15px Arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = black;
            break;
        }
        case 'spider_alpha': {
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = black;
        }
    }
}

function render(this: Window, msg: MessageEvent<any>) {
    canvas_format();
    let command = msg.data.command;
    // ctx.fillStyle = white;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // console.log("in render");
    let node: ast.ASTNode = JSON.parse(command);
    console.log(`node kind: ${node.kind}`);
    drawBaseNode(node);
    // ctx.fillStyle = red;
    // ctx.fillText(msg.data.command,50,50);
  }

function canvas_format() {
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = black;
}

window.addEventListener('message', render);
new EventSource('/esbuild').addEventListener('change', () => location.reload());
