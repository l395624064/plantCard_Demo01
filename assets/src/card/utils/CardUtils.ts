export class CardUtils {
    public static pickRandomIndex(length: number): number {
        if (length <= 0) {
            return -1;
        }
        return Math.floor(Math.random() * length);
    }
}
