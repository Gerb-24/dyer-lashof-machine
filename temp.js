const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener('change', (event) => {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
});

function onReaderLoad(event){
var json = JSON.parse(event.target.result);
const gensArr = json.gens;
        const degsArr = gensArr.map( obj => obj.deg );
        const namesArr = gensArr.map( obj => obj.name )
        const minDeg = Math.min(...degsArr);
        const maxDeg = Math.max(...degsArr);
        const colAmount = maxDeg - minDeg + 1;

        // Create edges
        let edgesArr = []
            for ( [target, obj] of gensArr.entries() ){
                let ob_edges = []
                for ( const power in obj.ops ){
                    ob_edges.push( ...obj.ops[power].map( (source) => [ source, target ] ) )
                }
                edgesArr.push( ...ob_edges )
            }

        // Create the grid
        const degData = new Map([])
        for ( let [ index, obj] of gensArr.entries()){
            if ( degData.has( obj.deg ) ){
                let cur = degData.get( obj.deg )
                degData.set(obj.deg, [ ...cur, index  ])
            }
            else{
                degData.set(obj.deg, [ index ])
            }
        }
        let row_str = []
        let keysArr = [...degData.keys()]
        keysArr.sort( (a,b) => a-b )
        for ( let key of keysArr ){
            let col_str = degData.get( key ).map((i) => `<button class="btn" id="${i}"></button>`).join('')
            row_str.push( `<div class="degree" >${col_str}</div>` )
        }
        document.getElementById('row').innerHTML = row_str.join('')


        for ( [i, name] of namesArr.entries() ){
            let btn = document.getElementById(i)
            katex.render(name, btn, {
                throwOnError: false
            });
            
            btn.addEventListener("click", function(i){return () => get_linked( i, edgesArr, gensArr )}(i));
        }
}

function get_linked( index, edgesArr, gensArr ){
            
            // set bg color on all cells
            for ( let i = 0; i < gensArr.length; i++ ){
                document.getElementById( i ).style.background = '#fff';
            }

            
            let linkedEdges = edgesArr.filter( edge => edge[0] === index || edge[1] === index )
            for ( edge of linkedEdges ){
                document.getElementById( edge[0] ).style.background = '#2ecc71';
                document.getElementById( edge[1] ).style.background = '#2ecc71';
            }
            document.getElementById( index ).style.background = '#3498db';
    }