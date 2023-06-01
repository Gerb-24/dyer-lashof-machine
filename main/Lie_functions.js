import { combinations } from "./operad_functions.js"

const cartan = (i) => {
    let ans = [];
    for (let k = 0; k <= i; k++) {
      ans.push([k, i - k]);
    }
    return ans;
  }

const nishida = ( r, s ) => {
    let ans = [];
    try{
        for (let t=0; t <= Math.floor( r/2 ); t++){
            let nishida_factor = combinations( s - r, r - 2*t )
            if (nishida_factor % 2 === 1){
                ans.push( [s - r + t, t] )
            }
        }
    } catch (e) {
        return ans
    }
    return ans
}

const adem = ( r, s ) => {
    let ans = [];
    for ( let t=0; t <= Math.floor( r - s - 1); t++){
        let adem_factor = combinations( 2*s - r + 1 + 2*t, t )
        if ( adem_factor % 2 === 1){
            ans.push( [2*s + 1 + t, r - s - 1- t] )
        } 
    }
    return ans
}

export { cartan, nishida, adem }