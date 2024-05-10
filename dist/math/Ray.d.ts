import { Vector3 } from "./Vector3";
import { Box3 } from "./Box3";
declare class Ray {
    origin: Vector3;
    direction: Vector3;
    constructor(origin: Vector3, direction: Vector3);
    /**
     * Berechnet einen Punkt auf dem Strahl bei einem bestimmten Skalar 't'.
     * @param t Der Skalarwert, der bestimmt, wie weit entlang des Strahls der Punkt liegt.
     * @returns Der Punkt auf dem Strahl.
     */
    getPoint(t: number): Vector3;
    /**
     * Prüft die Intersektion dieses Strahls mit einer gegebenen Bounding Box.
     * @param box Die Box, mit der die Intersektion geprüft werden soll.
     * @returns True, wenn der Strahl die Box schneidet, sonst false.
     */
    intersectsBox(box: Box3, maxDistance?: number): boolean;
}
export { Ray };
