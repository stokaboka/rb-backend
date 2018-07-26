/**
 * Created by stokaboka on 08.06.2016.
 */

api._ = api.underscore;

api.toolsBuilder = {};

api.toolsBuilder.numberToAlphaBets = function (__num) {
    var ___first_letter = 'A';
    var ___out = ___first_letter;
    var ___first_letter_code = ___first_letter.charCodeAt(0);
    var ___mx = Math.floor(__num / 26);
    if(___mx > 0) {
        for (var ___i = 0; ___i < ___mx; ___i++) {
            var ___n = __num - (___mx - ___i) * 26 - 1;
            ___out = ___out + String.fromCharCode(___first_letter_code + ___n);
        }
    }else{
        ___out = String.fromCharCode(___first_letter_code + __num);
    }
    return ___out;
};

api.toolsBuilder.JSON_stringify = function(__obj){
    var __out = JSON.stringify(__obj, function (___key, ___value) {
        if(___key == '__proto__') return undefined;
        else return ___value;
    });
    return __out;
};

api.toolsBuilder.JSON_parse = function(__str){
	var __out;
    if(typeof __str == "string") {
	    __out = JSON.parse(__str);
    }else{
	    __out = __str;
    }
	return __out;
};

api.toolsBuilder.regexp_match = function(__str, _regexp){
    var match = __str.match(_regexp);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    } else {
        return null;
    }
};