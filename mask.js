const translation = {
    "0": {pattern: /\d/},
    "#": {pattern: /\d/, recursive: true},
    "9": {pattern: /\d/, optional: true},
};

class MaskImp {

    constructor(mask, config = {}) {
        this._mask = mask;
        this._config = config;
    }

    masked(value) {
        value += "";
        let mask = this._mask;
        if (this._config.reverse) {
            mask = mask.split("").reverse().join("");
            value = value.split("").reverse().join("");
        }
        const buf = this._maskIt(mask, value);
        return this._config.reverse ? buf.reverse().join("") : buf.join("");
    }

    _maskIt(mask, value, result = [], resetPos = null) {
        if (mask.length === 0 || value.length === 0)
            return [...result, ...this._suffix(mask)];
        const trans = translation[mask[0]];
        if (trans) {
            if (value.charAt(0).match(trans.pattern)) {
                if (trans.recursive) {
                    if (!resetPos)
                        resetPos = mask;
                    else if (mask.length === 1)
                        return this._maskIt(resetPos, value.substring(1), result.concat(value.charAt(0)), resetPos);
                }
                return this._maskIt(mask.substring(1), value.substring(1), result.concat(value.charAt(0)), resetPos);
            }
            if (trans.optional)
                return this._maskIt(mask.substring(1), value, result, resetPos);
            return this._maskIt(mask, value.substring(1), result, resetPos);
        }
        return this._maskIt(mask.substring(1), value, result.concat(mask[0]), resetPos);
    }

    _suffix(mask) {
        const reversedMask = mask.split("").reverse();
        const lastMapChar = reversedMask.findIndex(m => !!translation[m]);
        return reversedMask
            .filter((m, i) => i < lastMapChar || lastMapChar === -1)
            .reverse()
            .join("");
    }
}

module.exports = (mask, config) => new MaskImp(mask, config);
