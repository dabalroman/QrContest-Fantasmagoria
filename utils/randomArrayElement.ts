export function getRandomArrayElement<T> (array: T[]): T | null {
    if (array.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

export function getRandomArrayElementWithWeights<T>(array: T[], weights: number[]): T | null {
    if (array.length === 0 || weights.length === 0 || array.length !== weights.length) {
        return null;
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomWeight = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (let i = 0; i < array.length; i++) {
        cumulativeWeight += weights[i];
        if (randomWeight < cumulativeWeight) {
            return array[i];
        }
    }

    return null;
}
