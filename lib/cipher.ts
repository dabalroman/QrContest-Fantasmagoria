function caesarCipher (text: string, shift: number): string {
    return text.split('')
        .map(char => {
            let charCode = char.charCodeAt(0);
            if (charCode >= 65 && charCode <= 90) {
                return String.fromCharCode((charCode - 65 + shift) % 26 + 65);
            } else {
                return char;
            }
        })
        .join('');
}

export function encrypt (text: string): string {
    if (text.slice(0, 1) === 'c') {
        return text;
    }

    return 'c' + btoa(caesarCipher(text, 15));
}

export function decrypt (text: string): string {
    if (text.slice(0, 1) !== 'c') {
        return text;
    }

    return caesarCipher(atob(text.slice(1)), 26 - 15);
}
