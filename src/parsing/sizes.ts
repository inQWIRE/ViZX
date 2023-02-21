import * as ast from './ast';
import { BASE_SIZE, PAD_SIZE, PROPTO_SIZE } from '../constants/consts';
export function addSizes(node: ast.ASTNode) : ast.ASTNode {
    switch (node.kind) {
        case 'const': {
            node.hor_len = BASE_SIZE;
            node.ver_len = BASE_SIZE;
            break;
        }
        case 'spider': {
            node.hor_len = BASE_SIZE;
            node.ver_len = BASE_SIZE;
            break;
        }
        case 'var': {
            node.hor_len = BASE_SIZE;
            node.ver_len = BASE_SIZE;
            break;
        }
        case 'stack': {
            let node_ = <ast.ASTStack>node;
            let sleft = addSizes(node_.left);
            let sright = addSizes(node_.right);
            if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
                // TODO
                node.hor_len = Math.max(sleft.hor_len, sright.hor_len) + 2*PAD_SIZE;
            }
            else {
                throw new Error(`Could not size children of ${node} as stack node: horizontal len`);
            }
            if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
                node.ver_len = sleft.ver_len + sright.ver_len + 4*PAD_SIZE;
            }
            else {
                throw new Error(`Could not size children of ${node} as stack node: vertical len`);
            }
            break;
        }
        case 'compose': {
            let node_ = <ast.ASTCompose>node;
            let sleft = addSizes(node_.left);
            let sright = addSizes(node_.right);
            if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
                node.ver_len = Math.max(sleft.ver_len, sright.ver_len) + 2*PAD_SIZE;
            }
            else {
                throw new Error(`Could not size children of ${node} as compose node: horizontal len`);
            }
            if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
                node.hor_len = sleft.hor_len + sright.hor_len + 4*PAD_SIZE;
            }
            else {
                throw new Error(`Could not size children of ${node} as compose node: vertical len`);
            }
            break;
        }
        case 'nstack': {
            let node_ = <ast.ASTNStack>node;
            let snode = addSizes(node_.node);
            if (snode.ver_len !== undefined && snode.hor_len !== undefined) {
                node.ver_len = snode.ver_len * parseInt(node_.n.val);
                node.hor_len = snode.hor_len;
            }
            else {
                throw new Error(`Could not size node ${node} as nstack node`);
            }
            break;
        }
        case 'nstack1': {
            let node_ = <ast.ASTNStack1>node;
            let snode = addSizes(node_.node);
            if (snode.ver_len !== undefined && snode.hor_len !== undefined) {
                node.ver_len = snode.ver_len * parseInt(node_.n.val);
                node.hor_len = snode.hor_len;
            }
            else {
                throw new Error(`Could not size node ${node} as nstack1 node`);
            }
            break;
        }
        case 'cast': {
            let node_ = <ast.ASTCast>node;
            let inner_node = addSizes(node_.node);
            if(inner_node.ver_len !== undefined && inner_node.hor_len !== undefined) {
                // TODO if pad
                node.ver_len = inner_node.ver_len;
                node.hor_len = inner_node.hor_len;
            }
            break;
        }
        case 'func': {
            // TODO
            let node_ = <ast.ASTFunc>node;
            break;
        }
        case 'propto': {
            let node_ = <ast.ASTPropTo>node;
            let sleft = addSizes(node_.l);
            let sright = addSizes(node_.r);
            if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
                node.ver_len = Math.max(sleft.ver_len, sright.ver_len);
            }
            else {
                throw new Error(`Could not size children of ${node} as propto node: horizontal len`);
            }
            if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
                // add space between TODO
                node.hor_len = sleft.hor_len + sright.hor_len + PROPTO_SIZE;
            }
            else {
                throw new Error(`Could not size children of ${node} as propto node: vertical len`);
            }
            break;
        }
        case 'nwire': {
            let node_ = <ast.ASTNWire>node;
            let snode: ast.ASTConst = { kind: 'const', val: ast.ZXConst.Wire };
            snode = <ast.ASTConst>addSizes(snode);
            if (snode.ver_len !== undefined && snode.hor_len !== undefined) {
                node.ver_len = snode.ver_len * parseInt(node_.n.val);
                node.hor_len = snode.hor_len;
            }
            else {
                throw new Error(`Could not size node ${node} as nwire node`);
            }
            break;
        }
        default: {
            throw new Error(`Unknown kind: ${node.kind}`);
        }
    };
    return node;
}