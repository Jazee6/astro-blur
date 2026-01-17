import {visit} from 'unist-util-visit';
import type {Element, Root} from 'hast';

const RehypeImage = () => {
    return (tree: Root) => {
        visit(tree, 'element', (node: Element) => {
            if (node.tagName === 'img') {
                node.properties = node.properties || {};
                node.properties.loading = 'lazy';
            }
        });
    };
};

export default RehypeImage;
