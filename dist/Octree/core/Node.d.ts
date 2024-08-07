import { Vector3 } from "../../math/Vector3";
export interface Node {
    /**
     *  The lower bounds of the node
     */
    min: Vector3;
    /**
     * The upper bounds of the node
     */
    max: Vector3;
    /**
     * The children of this node
     */
    children?: Node[] | null;
    /**
     * Calculates the center of this node
     *
     * @param result - The vector to store the result in
     * @return The vector that describes the center of this node
     */
    getCenter(result: Vector3): Vector3;
    /**
     * Calculates the size of this node
     *
     * @param result - The vector to store the result in
     * @return The vector that describes the size of this node
     */
    getDimensions(result: Vector3): Vector3;
}
