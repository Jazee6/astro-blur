import {defineHastPlugin} from "satteri";

/**
 * Marks every content image as lazy-loaded and zoomable (medium-zoom).
 */
export const hastImage = defineHastPlugin({
    name: "hast-image",
    element: {
        filter: ["img"],
        visit(node, context) {
            context.setProperty(node, "loading", "lazy");
            context.setProperty(node, "dataZoomable", "");
        },
    },
});
