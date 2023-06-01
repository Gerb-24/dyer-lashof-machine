import { combinations } from "./operad_functions.js";

const cartan = (i) => {
    let ans = [];
    for (let k = 0; k <= i; k++) {
      ans.push([k, i - k]);
    }
    return ans;
  }

const ordered_cartan = (i) => {
    let ans = [];
    for (let k = 0; k <= i; k++) {
        if (i-k < k){
            ans.push([k, i - k])
        }
    }
    return ans
}

const nishida = (r, s, d) => {
    let ans = [];
    for (let t = 0; t <= Math.floor(r / 2); t++) {
    
        try{
            let nishida_factor = combinations( d + s - r, r - 2*t );

            if (nishida_factor % 2 === 1) {
                ans.push( [s - r + 2*t, t] )
            }
        } catch (e) {
        return ans
        }
    }
    return ans
}

const adem = ( r, s )=> {
    let ans = [];
    for (let t = Math.ceil( (r + s)/2 ); t <= Math.floor( r - 1 ); t++){
        let adem_factor = combinations( t-s-1, 2*t-r-s )
        if ( adem_factor % 2 === 1 ){
            ans.push( [r+2*s-2*t, t] )
        }
    }
    return ans
}

export { cartan, ordered_cartan, adem, nishida }