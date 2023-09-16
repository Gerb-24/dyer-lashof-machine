import { range, cartan, nishida, adem } from "./Lie_functions.js";

class Operation {
    constructor(power, node) {
      this.power = power;
      this.next = node;
      this.degree = power + node.degree - 1;
      this.weight = 2 * node.weight;
    }
  
    toString() {
      return `Q^${this.power}(${this.next})`;
    }
  
    outputStr() {
      return `Q^{${this.power}} (${this.next.outputStr()})`;
    }
  
    isEqual(other) {
      return (
        this.constructor === other.constructor &&
        this.power === other.power &&
        this.next.isEqual( other.next )
      );
    }
  }
  
class Product {
constructor(node0, node1) {
    this.next0 = node0;
    this.next1 = node1;
    this.degree = node0.degree + node1.degree - 1;
    this.weight = node0.weight + node1.weight;
}

toString() {
    return `[${this.next0},${this.next1}]`;
}

outputStr() {
    return `\\left. [ ${this.next0.outputStr()},${this.next1.outputStr()} \\right. ]`;
}

isEqual(other) {
    return (
    this.constructor === other.constructor &&
    this.next0.isEqual( other.next0 ) &&
    this.next1.isEqual( other.next1 )
    );
}
}

class Generator {
constructor(index, degree) {
    this.index = index;
    this.next = null;
    this.degree = degree;
    this.weight = 1;
}

toString() {
    return `x_${this.index}`;
}

outputStr() {
    return this.toString();
}

isEqual(other) {
    return this.constructor === other.constructor && this.index === other.index;
}
}

class Element {
constructor(nodes) {
    this.nodes = nodes;
}

toString() {
    const nodesStr = this.nodes.map((node) => node.toString()).join("+");
    return nodesStr;
}

add(other) {
    const newNodes = [];
    const commonNodes = [];
    for (const node of other.nodes) {
    if (!this.nodes.some(e => node.isEqual(e))) {
        newNodes.push(node);
    } else {
        commonNodes.push(node);
    }
    }
    for (const node of this.nodes) {
    if (!commonNodes.some(e => node.isEqual(e))) {
        newNodes.push(node);
    }
    }
    return new Element(newNodes);
}
}
  
function eltSum(eltList) {
    let ans = new Element([]);
    for (const elt of eltList) {
        ans = ans.add(elt);
    }
    return ans;
}

export function Lie_operad(baseDegs, baseOps, maxDim, maxWeight) {
  const Steenrod = (i, node) => {
      if (i === 0) {
          let elt = new Element([node]);
          return elt;
        }
    
        if (node instanceof Generator) {
          if (i in baseOps[node.index]) {
            let elt = new Element(
              baseOps[node.index][i].map((j) => new Generator(j, baseDegs[j]))
            );
            return elt;
          } else {
            return new Element([]);
          }
        }
    
        if (node instanceof Operation) {
          // nishida relations
          let elt_list = nishida(i, node.power).map(([a, b]) =>
            OperationFunc(a, Steenrod(b, node.next))
          );
          return eltSum(elt_list);
        }
    
        if (node instanceof Product) {
          // cartan formula
          let elt_list = cartan(i).map(([a, b]) =>
            ProductFunc(Steenrod(a, node.next0), Steenrod(b, node.next1))
          );
          return eltSum(elt_list);
        }
        console.log(node.toString())
        throw new Error()
    }

    const ProductFunc = (node0, node1) => {
      if (node0 instanceof Element && node1 instanceof Element) {
        // bilinear
        let eltList = [];
        for (let _node0 of node0.nodes) {
          for (let _node1 of node1.nodes) {
            eltList.push(ProductFunc(_node0, _node1));
          }
        }
        return eltSum(eltList);
      }
    
      if (node0 instanceof Operation || node1 instanceof Operation) {
        return new Element([]);
      }
    
      if (
        [Product, Generator].includes(node0.constructor) &&
        [Product, Generator].includes(node1.constructor)
      ) {
        if (node0.isEqual(node1)) {
          let elt = new Element([
            new Operation(node0.degree, node0),
          ]);
          return elt;
        }
    
        let index0 = bracketOrder.findIndex((e) => node0.isEqual(e));
        let index1 = bracketOrder.findIndex((e) => node1.isEqual(e));
    
        if (index0 > index1) {
          return ProductFunc(node1, node0);
        }
    
        if (node1 instanceof Product) {
          
          let index10 = bracketOrder.findIndex((e) => node1.next0.isEqual(e));
          if (index10 > index0) {
            let eltList = [
              ProductFunc(
                new Element([node1.next0]),
                ProductFunc(node0, node1.next1)
              ),
              ProductFunc(
                new Element([node1.next1]),
                ProductFunc(node0, node1.next0)
              ),
            ];
            return eltSum(eltList);
          }
        }
    
        let elt = new Element([
          new Product(node0, node1),
        ]);
        return elt;
      }
    
      throw new Exception();
    };
    

    const OperationFunc = (i, node) => {
      if (node instanceof Element) {
        // additivity
        let eltList = node.nodes.map((_node) =>
          OperationFunc(i, _node)
        );
        return eltSum(eltList);
      }
    
      if (i < node.degree) {
        return new Element([]);
      }
    
      if (node instanceof Operation) {
        if (i > 2 * node.power) {
          let elt = new Element([
            new Operation(i, node),
          ]);
          return elt;
        }
        // adem relation
        let eltList = adem(i, node.power).map(([a, b]) =>
          OperationFunc(a, OperationFunc(b, node.next))
        );
        return eltSum(eltList);
      }
    
      if (node instanceof Product || node instanceof Generator) {
        let elt = new Element([
          new Operation(i, node),
        ]);
        return elt;
      }
    };
    
    
    const productBasisFunc = () => {
      let generators = baseDegs.map((d, i) => new Generator(i, d));
      let weight = 1;
      while (weight < maxWeight) {
        let brackets = [];
        weight += 1;
    
        for (let [index1, node1] of generators.entries()) {
          for (let [index0, node0] of generators.slice(0, index1).entries()) {
            // check dimension
            if (node0.degree + node1.degree - 1 >= maxDim) {
              continue;
            }
    
            // check weight
            if (node0.weight + node1.weight !== weight) {
              continue;
            }
    
            // check jacobi
            if (node1 instanceof Product) {
              let index10 = generators.findIndex((e) => node1.next0.isEqual(e));
              if (index10 > index0) {
                continue;
              }
            }
            brackets.push(new Product(node0, node1));
          }
        }
        generators.push(...brackets);
      }
    
      return generators;
    };
    

    const operationBasisFunc = (generators) => {
      let operations = [...generators];
      while (operations.length) {
        let newOperations = [];
        for (let node of operations) {
          if (2 * node.weight > maxWeight) {
            continue;
          }
          let operationsList;
          if (node instanceof Operation) {
            operationsList = range( 2*node.power + 1, maxDim - node.degree ).map( power  => 
              new Operation( power, node)
            );
          } else {
            operationsList = range( node.degree, maxDim - node.degree ).map( power =>
              new Operation( power, node )
            );
          }
          newOperations.push(...operationsList);
        }
        generators.push(...newOperations);
        operations = [...newOperations];
      }
      return generators;
    };
    

    function monomialsToData(monomials) {
      let min_deg = Math.min(...monomials.map((mon) => mon.degree));
      let data_list = monomials.map((node) => ({
        name: node.outputStr(),
        deg: node.degree,
        ops: {},
      }));
  
      let edgesMap = new Map();
      for (let i = 0; i < monomials.length; i++) {
        edgesMap.set(i, []);
      }
      let dualEdgesMap = new Map();
      for (let i = 0; i < monomials.length; i++) {
        dualEdgesMap.set(i, []);
      }
  
      for (let [ind, node] of monomials.entries()) {
        console.log(`ops on monomial ${ind}: ${node}`);
        for (let i = 1; i <= node.degree - min_deg; i++) {
          let sq_list = [];
          for (let _node of Steenrod(i, node).nodes) {
            let index = monomials.findIndex((e) => _node.isEqual(e));
            console.log(` Sq_${i}: ${_node}: ${index}`);
            edgesMap.get(ind).push( index )
            dualEdgesMap.get(index).push( ind )
            sq_list.push(index);
          }
          if (sq_list.length) {
            data_list[ind].ops[i] = sq_list;
          }
        }
      }
  
      let data = { gens: data_list };
      return [data, edgesMap, dualEdgesMap]
    }

  const bracketOrder = productBasisFunc();
  const monomials = operationBasisFunc(bracketOrder).slice(baseDegs.length);
  return monomialsToData(monomials)
}