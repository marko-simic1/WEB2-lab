export function validateUserId(id: string) {
    const input = (id ?? "").trim();
    if (input.length === 0 || input.length > 20) {
        throw new Error("Broj dokumenta mora imati od 1 do 20 znakova");
    }
    return input;
}

export function validateUserInput(input: string | number[]) {
    let raw: string[] = [];

    if (Array.isArray(input)) {
        raw = input as any;
    } else {
        raw = String(input)
            .split(",")
            .map(x => x.trim())
            .filter(x => x !== "");
    }

    const nums = raw.map(n => Number(n));
    if (nums.length < 6 || nums.length > 10) {
        throw new Error("Treba odabrati 6 do 10 brojeva");
    }
    if (nums.some(n => n < 1 || n > 45)) {
        throw new Error("Brojevi moraju biti u rasponu od 1 do 45");
    }
    const set = new Set(nums);
    if (set.size !== nums.length) {
        throw new Error("Neki brojevi se ponavljaju");
    }
    return nums;
}
