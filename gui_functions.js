import { E_inf_operad } from "./main/E_inf.js";
import { Lie_operad } from "./main/Lie.js";
import { E_n_operad } from "./main/E_n.js";


const logText = () => {
    var text = document.getElementById("myText").value;
    var operadType = document.querySelector('input[name="options"]:checked').id;
    var maxDim = document.getElementById("maxDim").value;
    var maxWeight = document.getElementById("maxWeight").value;
    const lines = text.split('\n');
    const preGens = lines[2].split(' ');
    // create the list of generators with their degrees
    const data = { gens: [] };
    for (const x of preGens) {
      data.gens.push({ deg: parseInt(x), ops: {} });
    }
    
    const op_lines = lines.slice(4).map( op_line => op_line.split(' ') );
    for (const x of op_lines) {
        data.gens[parseInt(x[0])].ops[parseInt(x[1])] = x.slice(3).map(y => parseInt(y));
    }
    
    //generate the baseDegrees and baseOperations out of the data

    const baseDegrees = data.gens.map(gen => gen.deg);
    const baseOperations = data.gens.map(() => ({}));
    data.gens.forEach((gen, i) => {
        for (const pow in gen.ops) {
            baseOperations[i][parseInt(pow)] = gen['ops'][pow];
        }
    });

    if ( operadType === 'E_inf' ){
        var [newData, edgesMap, dualEdgesMap] = E_inf_operad(baseDegrees, baseOperations, maxDim, maxWeight);
    }
    if ( operadType === 'sLie' ){
        var [newData, edgesMap, dualEdgesMap] = Lie_operad(baseDegrees, baseOperations, maxDim, maxWeight);
    }
    if ( operadType === 'E_n' ){
        let n_data = document.getElementById("n").value;
        console.log(n_data)
        var [newData, edgesMap, dualEdgesMap]  = E_n_operad(baseDegrees, baseOperations, maxDim, maxWeight, parseInt(n_data));
    }
    
    
    const degData = new Map([])
    for ( let [ index, obj] of newData.gens.entries()){
        if ( degData.has( obj.deg ) ){
            let cur = degData.get( obj.deg )
            degData.set(obj.deg, [ ...cur, index  ])
        }
        else{
            degData.set(obj.deg, [ index ])
        }
    }
    let row_str = []
    const keysArr = [...degData.keys()].toSorted((a, b) => a - b)
    for ( let key of keysArr ){
        let col_str = degData.get( key ).map((i) => `<button class="btn" id="${i}">hello</button>`).join('')
        row_str.push( `<div class="degree" ><p id="k:${key}"><p/>${col_str}</div>` )
        row_str.push('<hr style="width:100%;text-align:left;margin-left:0">')
    }
    document.getElementById('row').innerHTML = row_str.join('')

    for ( let key of keysArr ){
        let n = `H_{${key}}:`
        let p = document.getElementById(`k:${key}`)
        katex.render(n, p, {
            throwOnError: false
          });
    }

    const namesArr = newData.gens.map( obj => obj.name )
    
    for (let index = 0; index < namesArr.length; index++) {
        let i = index;
        let n = namesArr[index];
        let btn = document.getElementById(i);
        katex.render(n, btn, {
          throwOnError: false
        });
        btn.addEventListener("click", function(i){return () => get_linked( i, edgesMap, dualEdgesMap, namesArr.length )}(i));
    }
    // console.log(edgesMap)
}

function get_linked( i, edgesMap, dualEdgesMap, l ){

    // first clean up all the colored elements
    for (let j =0; j<l; j++){
        document.getElementById(j).style.background = '#fff'
    }

    document.getElementById(i).style.background = '#3498db'
    for ( let j of edgesMap.get(i)){
        document.getElementById(j).style.background = '#a7dcfc'
    }
    for ( let j of dualEdgesMap.get(i)){
        document.getElementById(j).style.background = '#a7dcfc'
    }
}

// first we bind logText to the buttons click listener
document.getElementById("myButton").addEventListener('click', logText)