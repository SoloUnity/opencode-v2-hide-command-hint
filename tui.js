import { BoxRenderable } from "@opentui/core";
import { onCleanup } from "solid-js";

const id = "opencode-v2-hide-command-hint";

export default {
  id,
  setup(context) {
    return context.ui.slot({
      append: "prompt.footer",
      render() {
        const hidden = new Map();
        const marker = new BoxRenderable(context.renderer, {
          id: `${id}-${crypto.randomUUID()}`,
          position: "absolute",
          width: 0,
          height: 0,
        });

        // The built-in footer exposes one shared slot. Hide its command hint
        // before layout, using the current shortcut rather than a fixed key.
        marker.onLifecyclePass = () => {
          const shortcut = context.keymap.shortcuts("command.palette.show")[0] ?? "";
          const hint = `${shortcut} commands`.trim();
          for (const [node, visible] of hidden) {
            if (node.isDestroyed) {
              hidden.delete(node);
            } else if (node.parent !== marker.parent || node.plainText?.trim() !== hint) {
              node.visible = visible;
              hidden.delete(node);
            }
          }
          for (const node of marker.parent?.getChildren() ?? []) {
            if (node.plainText?.trim() !== hint) continue;
            if (!hidden.has(node)) hidden.set(node, node.visible);
            node.visible = false;
          }
        };

        onCleanup(() => {
          for (const [node, visible] of hidden) {
            if (!node.isDestroyed) node.visible = visible;
          }
          hidden.clear();
          marker.destroyRecursively();
        });
        return marker;
      },
    });
  },
};
