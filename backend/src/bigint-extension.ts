declare global {
    interface BigInt {
        toJSON(): string | number;
    }
}

BigInt.prototype.toJSON = function (): string | number {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

