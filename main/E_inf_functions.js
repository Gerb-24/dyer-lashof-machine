import { combinations } from "./operad_functions.js";

const cartan = (i) => {
    let ans = [];
    for (let k = 0; k <= i; k++) {
      ans.push([k, i - k]);
    }
    return ans;
  }

const nishida = (r, s) => {
    let ans = [];
    for (let t = 0; t <= Math.floor(r / 2); t++) {
        try {
        let nishidaFactor = combinations(s - r, r - 2 * t);
        if (nishidaFactor % 2 === 1) {
          ans.push([s - r + t, t]);
          }
        } catch (e) {
        return ans;
        }
        
    }
    return ans;
}

const adem = (r, s) => {
    let ans = [];
    for (let i = Math.ceil(r / 2); i <= r - s - 1; i++) {
      let ademFactor = combinations(i - s - 1, 2 * i - r);
      if (ademFactor % 2 === 1) {
        ans.push([s + r - i, i]);
      }
    }
    return ans;
  }
  

  
  export { cartan, nishida, adem };