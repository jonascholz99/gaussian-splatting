import { Node } from "./Node";
export interface Tree extends Node {
    /**
     * Calculates the depth of the tree
     *
     * @return the depth
     */
    getDepth(): number;
    /**
     * Fetches all nodes of a specified depth leven
     *
     * @param level - The depth level
     * @return The nodes
     */
    findNodesByLevel(level: number): Node[];
}
