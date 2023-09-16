import { range, cartan, nishida, adem } from "./E_inf_functions.js"

class Operation {
  constructor(power, node) {
    this.power = power;
    this.next = node;
    this.degree = power + node.degree;
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
    this.degree = node0.degree + node1.degree;
    this.weight = node0.weight + node1.weight;
  }

  toString() {
    return `${this.next0} * ${this.next1}`;
  }

  outputStr() {
    return `${this.next0.outputStr()} * ${this.next1.outputStr()}`;
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

export function E_inf_operad(baseDegs, baseOps, maxDim, maxWeight) {
  function Steenrod(i, node) {
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

  function ProductFunc(node_0, node_1) {
    if (node_0 instanceof Element && node_1 instanceof Element) {
      // bilinear
      let elt_list = [];
      for (let _node_0 of node_0.nodes) {
        for (let _node_1 of node_1.nodes) {
          elt_list.push(ProductFunc(_node_0, _node_1));
        }
      }
      return eltSum(elt_list);
    }

    if (node_0 instanceof Product) {
      let elt_0 = new Element([node_0.next0]);
      let elt = ProductFunc(elt_0, ProductFunc(node_0.next1, node_1));
      return elt;
    }
    if ([Operation, Generator].includes(node_0.constructor)) {
      if (node_1 instanceof Product) {
        if (
          operationOrder.findIndex((e) => node_0.isEqual(e)) <
          operationOrder.findIndex((e) => node_1.next0.isEqual(e))
        ) {
          let elt_0 = new Element([node_1.next0]);
          let elt = ProductFunc( elt_0, ProductFunc(node_0, node_1.next1));
          return elt;
        }

        if (node_0.isEqual(node_1.next0)) {
          let elt = ProductFunc(
            new Operation(node_0.degree, node_0),
            node_1.next1
          );
          return elt;
        }
      }

      if ([Operation, Generator].includes(node_1.constructor)) {
        if (node_0.isEqual(node_1)) {
          let elt = new Element([new Operation(node_0.degree, node_0)]);
          return elt;
        }

        if (
          operationOrder.findIndex((e) => node_0.isEqual(e)) <
          operationOrder.findIndex((e) => node_1.isEqual(e))
        ) {
          let elt = ProductFunc(node_1, node_0);
          return elt;
        }
      }
      let elt = new Element([new Product(node_0, node_1)]);
      return elt;
    }
    console.log( node_0, node_1 )
    throw new Error();
  }

  function OperationFunc(i, node) {
    if (node instanceof Element) {
      // additivity
      let elt_list = node.nodes.map((_node) => OperationFunc(i, _node));
      return eltSum(elt_list);
    }

    if (i < node.degree) {
      return new Element([]);
    }

    if (node instanceof Operation) {
      if (i <= 2 * node.power) {
        let elt = new Element([new Operation(i, node)]);
        return elt;
      }
      // adem relation
      let elt_list = adem(i, node.power).map(([a, b]) =>
        OperationFunc(a, OperationFunc(b, node.next))
      );
      return eltSum(elt_list);
    }

    if (node instanceof Product) {
      // cartan formula
      let elt_list = cartan(i).map(([a, b]) =>
        ProductFunc(
          OperationFunc(a, node.next0),
          OperationFunc(b, node.next1)
        )
      );
      return eltSum(elt_list);
    }

    if (node instanceof Generator) {
      let elt = new Element([new Operation(i, node)]);
      return elt;
    }
  }

  function operationBasisFunc() {
    const generators = baseDegs.map((d, i) => new Generator(i, d));
    let operations = [...generators];
    while (operations.length > 0) {
      const newOperations = [];
      for (const node of operations) {
        if (2 * node.weight > maxWeight) continue;
        let operationsList = [];
        if (node instanceof Operation) {
          operationsList = range( node.degree, Math.min( maxDim - node.degree, 2*node.power) + 1 ).map( power =>
            new Operation( power, node )
          );
        } else {
          operationsList = range( node.degree, maxDim - node.degree + 1 ).map( power =>
            new Operation( power, node )
          );
        }
        newOperations.push(...operationsList);
      }
      generators.push(...newOperations);
      operations = [...newOperations];
    }
    return generators;
  }

  function productBasisFunc(operationOrder) {
    const generators = [...operationOrder];
    let products = [...operationOrder];
    while (products.length > 0) {
      const newProducts = [];
      for (const node of products) {
        for (const [index, operation] of operationOrder.entries()) {
          if (operation.degree + node.degree > maxDim) continue;
          if (operation.weight + node.weight > maxWeight) continue;
          if (node instanceof Operation || node instanceof Generator) {
            if (index > operationOrder.findIndex((e) => node.isEqual(e))) {
              const newProduct = new Product(operation, node);
              newProducts.push(newProduct);
            }
          }
          if (node instanceof Product) {
            if (
              index > operationOrder.findIndex((e) => node.next0.isEqual(e))
            ) {
              const newProduct = new Product(operation, node);
              newProducts.push(newProduct);
            }
          }
        }
      }
      generators.push(...newProducts);
      products = [...newProducts];
    }
    return generators;
  }

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

  const operationOrder = operationBasisFunc();
  const monomials = productBasisFunc(operationOrder).slice(baseDegs.length);
  return monomialsToData(monomials)
}
