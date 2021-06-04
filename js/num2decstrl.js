/**
 * 数値を整数・少数表記に変換する。
 * 内部的には、指数表記の文字列をパースし、小数表記に変換している。
 *
 * @param {number|string} number 変換したい数値、または数値形式の文字列。
 *     数値型であればNaNやInfinityも指定できるが、そのまま文字列化して返される。
 * @return {string} 小数表記の数値文字列
 * @throws 適切な形式の数値、または文字列が与えられなかった場合に発生する。
 *
 * Note: この関数は、JavaScriptで正確な数値演算を行うために使う**べきではない**。
 *       この関数でなければ変換できない数値は、JavaScriptの内部データの時点で誤差が発生しており、正確な演算は期待できない。
 *       また、この関数によって変換された数値が厳密に正しい事も保証しない。
 *       この関数は、JavaScriptで生成した数値を「見やすく表示する」ためにのみ使用するべきである。
 * Note: この関数の設計が正しければ（つまり、バグが無ければ）、エラーが発生するのは誤った形式の文字列を与えられた場合のみとなる。
 *       逆に言えば、数値のプリミティブ型が与えられた場合は、いかなる場合でもエラーは発生しないはずである。
 *       もし、数値が与えられた場合にもエラーが発生してしまった場合は、この関数のバグを修正する必要がある。
 */
 const Num2FracStr = number => {
    /*
     * 引数の値を文字列化
     */
    const numStr = String(number);
  
    /*
     * 正規表現でマッチング
     */
    const match = numStr.match(/^([+-]?)0*([1-9][0-9]*|)(?:\.([0-9]*[1-9]|)0*)?(?:[eE]([+-]?[0-9]+))?$/);
  
    /*
     * 引数の型が適切な形式ではない場合…
     */
    if (!match) {
      if (typeof number == "number") {
        /*
         * 引数の型が数値であれば、文字列化した値をそのまま返す
         */
        return numStr;
      } else {
        /*
         * 引数の型が数値でなければ、エラーにする
         */
        throw new Error(`Invalid Number: "${numStr}"`);
      }
    }
  
    /** @type {string} 数の符号 */
    const sign = (match[1] === "-" ? "-" : "");
    /** @type {string} 仮数部の整数部 */
    const mantissa_int = match[2];
    /** @type {string} 仮数部の少数部 */
    const mantissa_frac = (match[3] ? match[3] : "");
    /** @type {number} 指数部 */
    const exponent = Number(match[4]);
  
    let returnValue = "";
  
    if (exponent) {
      /*
       * exponentがundefinedではなく（正規表現で指数部がマッチしていて）、
       * かつ、0ではない場合、指数表記として処理を開始する
       *
       * Note: 指数部が0の場合、ここで処理する意味は無いので少数表記として処理する。
       *       よって、指数部が0以外の場合にここで処理する。
       * Note: undefinedは数値化されるとNaNになり、false相当となる。
       *       一方、0の場合もfalse相当となる。
       *       ので、↑の条件文はコレで合っている。
       */
  
      /** @type {string} */
      const mantissa_str = mantissa_int + mantissa_frac;
      /** @type {number} */
      const mantissa_len = mantissa_str.length;
  
      if (0 < mantissa_len) {
        /** @type {number} */
        const mantissa_int_len = mantissa_int.length + exponent;
    
        /*
        12.145e+7  121450000             ;  mantissa_str: "12145"  mantissa_int_len: 9   ;  小数部が存在しない数値
        12.145e+6   12145000             ;  mantissa_str: "12145"  mantissa_int_len: 8   ;  小数部が存在しない数値
        12.145e+5    1214500             ;  mantissa_str: "12145"  mantissa_int_len: 7   ;  小数部が存在しない数値
        12.145e+4     121450             ;  mantissa_str: "12145"  mantissa_int_len: 6   ;  小数部が存在しない数値
        12.145e+3      12145             ;  mantissa_str: "12145"  mantissa_int_len: 5   ;  小数部が存在しない数値
        12.145e+2       1214.5           ;  mantissa_str: "12145"  mantissa_int_len: 4   ;  小数部が存在し、かつ、1より大きい数値
        12.145e+1        121.45          ;  mantissa_str: "12145"  mantissa_int_len: 3   ;  小数部が存在し、かつ、1より大きい数値
        12.145e0          12.145         ;  mantissa_str: "12145"  mantissa_int_len: 2   ;  小数部が存在し、かつ、1より大きい数値
        12.145e-1          1.2145        ;  mantissa_str: "12145"  mantissa_int_len: 1   ;  小数部が存在し、かつ、1より大きい数値
        12.145e-2          0.12145       ;  mantissa_str: "12145"  mantissa_int_len: 0   ;  小数部が存在し、かつ、1未満の数値
        12.145e-3          0.012145      ;  mantissa_str: "12145"  mantissa_int_len: -1  ;  小数部が存在し、かつ、1未満の数値
        12.145e-4          0.0012145     ;  mantissa_str: "12145"  mantissa_int_len: -2  ;  小数部が存在し、かつ、1未満の数値
        12.145e-5          0.00012145    ;  mantissa_str: "12145"  mantissa_int_len: -3  ;  小数部が存在し、かつ、1未満の数値
        12.145e-6          0.000012145   ;  mantissa_str: "12145"  mantissa_int_len: -4  ;  小数部が存在し、かつ、1未満の数値
        12.145e-7          0.0000012145  ;  mantissa_str: "12145"  mantissa_int_len: -5  ;  小数部が存在し、かつ、1未満の数値
        */
  
        if (mantissa_len <= mantissa_int_len) {
          /*
           * 小数部が存在しない数値（ex: 0, 12, 176, 1214500）の場合の処理
           */
          returnValue = mantissa_str.padEnd(mantissa_int_len, "0");
  
        } else if (0 < mantissa_int_len) {
          /*
           * 小数部が存在し、かつ、1より大きい数値（ex: 1.26, 1.0009, 121.45）の場合の処理
           */
          returnValue = mantissa_str.slice(0, mantissa_int_len) + "." + mantissa_str.slice(mantissa_int_len);
  
        } else {
          /*
           * 小数部が存在し、かつ、1未満の数値（ex: 0.26, 0.20098, 0.0012145）の場合の処理
           */
          returnValue = "0." + "0".repeat(-mantissa_int_len) + mantissa_str;
        }
      }
  
    } else if (mantissa_frac) {
      /*
       * 少数表記の場合
       */
      returnValue = (mantissa_int || "0") + "." + mantissa_frac;
  
    } else if (mantissa_int) {
      /*
       * 整数表記の場合
       */
      returnValue = mantissa_int;
    }
  
    return (returnValue) ? sign + (
      returnValue
        /* 先頭の余計なゼロを削除 */
        .replace(/^(?:0(?!\.|$))+/, "")
        /* 末尾の余計なゼロを削除 */
        .replace(/(?:\.0+|(\.[0-9]*[1-9])0+)$/, "$1")
    ) : "0";
  };
  
