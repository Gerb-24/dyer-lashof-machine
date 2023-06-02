import { cartan, ordered_cartan, adem, nishida } from "./E_n_functions.js";

class Operation {
  constructor(power, node) {
    this.power = power;
    this.next = node;
    this.degree = power + 2*node.degree;
    this.weight = 2 * node.weight;
  }

  toString() {
    return `Q_${this.power}(${this.next})`;
  }

  outputStr() {
    return `Q_{${this.power}} (${this.next.outputStr()})`;
  }

  isEqual(other) {
    return (
      this.constructor === other.constructor &&
      this.power === other.power &&
      this.next.isEqual(other.next)
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
      this.next0.isEqual(other.next0) &&
      this.next1.isEqual(other.next1)
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
      if (!this.nodes.some((e) => node.isEqual(e))) {
        newNodes.push(node);
      } else {
        commonNodes.push(node);
      }
    }
    for (const node of this.nodes) {
      if (!commonNodes.some((e) => node.isEqual(e))) {
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

export function E_n_operad(baseDegs, baseOps, maxDim, maxWeight, n) {
  class Browder {
    constructor(node0, node1) {
      this.next0 = node0;
      this.next1 = node1;
      this.degree = node0.degree + node1.degree + (n - 1);
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
        this.next0.isEqual(other.next0) &&
        this.next1.isEqual(other.next1)
      );
    }
  }
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
      let eltList = nishida(i, node.power, node.next.degree).map(([a, b]) =>
        OperationFunc(a, Steenrod(b, node.next))
      );
      if (node.power === n - 1) {
        let topEltList = ordered_cartan(i).map(([a, b]) =>
          BrowderFunc(Steenrod(a, node.next), Steenrod(b, node.next))
        );
        eltList.push(...topEltList);
      }
      return eltSum(eltList);
    }

    if (node instanceof Product) {
      // cartan formula
      let eltList = cartan(i).map(([a, b]) =>
        ProductFunc(Steenrod(a, node.next0), Steenrod(b, node.next1))
      );
      return eltSum(eltList);
    }

    if (node instanceof Browder) {
      // cartan formula
      let eltList = cartan(i).map(([a, b]) =>
        BrowderFunc(Steenrod(a, node.next0), Steenrod(b, node.next1))
      );
      return eltSum(eltList);
    }
  };

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

    if (node0 instanceof Product) {
      let elt0 = new Element([node0.next0]);
      let elt = ProductFunc(elt0, ProductFunc(node0.next1, node1));
      return elt;
    }

    if ([Browder, Operation, Generator].includes(node0.constructor)) {
      if (node1 instanceof Product) {
        let index0 = operationOrder.findIndex((e) => node0.isEqual(e));
        let index10 = operationOrder.findIndex((e) => node1.next0.isEqual(e));
        if (index0 < index10) {
          let elt0 = new Element([node1.next0]);

          let elt = ProductFunc(node0, node1.next1);
          return elt;
        }

        if (node0.isEqual(node1.next0)) {
          let elt = ProductFunc(new Operation(0, node0), node1.next1);
          return elt;
        }
      }

      if ([Browder, Operation, Generator].includes(node1.constructor)) {
        if (node0.isEqual(node1)) {
          let elt = new Element([new Operation(0, node0)]);
          return elt;
        }
        let index0 = operationOrder.findIndex((e) => node0.isEqual(e));
        let index1 = operationOrder.findIndex((e) => node1.isEqual(e));
        if (index0 < index1) {
          let elt = ProductFunc(node1, node0);
          return elt;
        }
      }
      let elt = new Element([new Product(node0, node1)]);
      return elt;
    }
    console.log( node0, node1 )
    throw new Error();
  };

  const BrowderFunc = (node0, node1) => {
    if (node0 instanceof Element && node1 instanceof Element) {
      // Biliniearity
      let eltList = [];
      for (let _node0 of node0.nodes) {
        for (let _node1 of node1.nodes) {
          eltList.push(BrowderFunc(_node0, _node1));
        }
      }
      return eltSum(eltList);
    }

    if (node0 instanceof Operation && node0.power < n - 1) {
      // Dyer–Lashof vanishing
      return new Element([]);
    }

    if (node1 instanceof Operation && node1.power < n - 1) {
      // Dyer–Lashof vanishing
      return new Element([]);
    }

    if (node0.isEqual(node1)) {
      // Antisymmetry 2
      return new Element([]);
    }

    if (node0 instanceof Operation && node0.power === n - 1) {
      // Adjoint identity
      let elt0 = new Element([node0.next]);
      let elt = BrowderFunc(elt0, BrowderFunc(elt0, node1));
      return elt;
    }

    if (node1 instanceof Operation && node1.power === n - 1) {
      // Adjoint identity
      let elt0 = new Element([node1.next]);
      let elt = BrowderFunc(elt0, BrowderFunc(elt0, node0));
      return elt;
    }

    if (node0 instanceof Product) {
      // Leibniz rule
      let elt0 = new Element([node0.next0]);
      let elt1 = new Element([node0.next1]);
      let eltList = [
        ProductFunc(BrowderFunc(node1, node0.next0), elt1),
        ProductFunc(elt0, BrowderFunc(node1, node0.next1)),
      ];
      return eltSum(eltList);
    }

    if (node1 instanceof Product) {
      // Leibniz rule
      let elt0 = new Element([node1.next0]);
      let elt1 = new Element([node1.next1]);
      let eltList = [
        ProductFunc(BrowderFunc(node0, node1.next0), elt1),
        ProductFunc(elt0, BrowderFunc(node0, node1.next1)),
      ];
      return eltSum(eltList);
    }

    if (
      [Browder, Generator].includes(node0.constructor) &&
      [Browder, Generator].includes(node1.constructor)
    ) {
      let index0 = browderOrder.findIndex((e) => node0.isEqual(e));
      let index1 = browderOrder.findIndex((e) => node1.isEqual(e));

      if (index0 > index1) {
        return BrowderFunc(node1, node0);
      }

      if (node1 instanceof Browder) {
        let index10 = browderOrder.findIndex((e) => node1.next0.isEqual(e));
        if (index10 > index0) {
          let eltList = [
            BrowderFunc(
              new Element([node1.next0]),
              BrowderFunc(node0, node1.next1)
            ),
            BrowderFunc(
              new Element([node1.next1]),
              BrowderFunc(node0, node1.next0)
            ),
          ];
          return eltSum(eltList);
        }
      }

      let elt = new Element([new Browder(node0, node1)]);
      return elt;
    }

    throw new Error();
  };

  const OperationFunc = (i, node) => {
    if (node instanceof Element) {
      if (!node.nodes.length) {
        return new Element([]);
      }

      if (i === n - 1) {
        // Top additivity
        if (node.nodes.length === 1) {
          let elt = OperationFunc(i, node.nodes[0]);
          return elt;
        }
        let eltList = [
          OperationFunc(i, node.nodes[0]),
          OperationFunc(i, new Element(node.nodes.slice(1))),
          BrowderFunc(
            new Element([node.nodes[0]]),
            new Element(node.nodes.slice(1))
          ),
        ];
        return eltSum(eltList)
      }
        // Additivity
        let eltList = node.nodes.map((_node) => OperationFunc(i, _node));
        return eltSum(eltList);
    }

    if (i < 0) {
      return new Element([]);
    }

    if (node instanceof Operation) {
      if (i <= node.power) {
        let elt = new Element([new Operation(i, node)]);
        return elt;
      }
      // adem relation
      let eltList = adem(i, node.power).map(([a, b]) =>
        OperationFunc(a, OperationFunc(b, node.next))
      );
      return eltSum(eltList);
    }

    if (node instanceof Product) {
      // Cartan formula
      let eltList = cartan(i).map(([a, b]) =>
        ProductFunc(OperationFunc(a, node.next0), OperationFunc(b, node.next1))
      );
      if (i === n - 1) {
        // Top Cartan formula
        let elt0 = new Element([node.next0]);
        let elt1 = new Element([node.next1]);
        let topElt = ProductFunc(
          elt0,
          ProductFunc(BrowderFunc(node.next0, node.next1), elt1)
        );
        eltList.push(topElt);
      }

      return eltSum(eltList);
    }

    if ([Browder, Generator].includes(node.constructor)) {
      let elt = new Element([new Operation(i, node)]);
      return elt;
    }

    console.log(i, node);
    console.log( node.constructor )
    throw new Error();
  };

  const BrowderBasisFunc = () => {
    let generators = baseDegs.map((d, i) => new Generator(i, d));
    let weight = 1;
    while (weight < maxWeight) {
      let brackets = [];
      weight += 1;

      for (let [index1, node1] of generators.entries()) {
        for (let [index0, node0] of generators.slice(0, index1).entries()) {
          // check dimension
          if (node0.degree + node1.degree + n - 1 > maxDim) {
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
          brackets.push(new Browder(node0, node1));
        }
      }
      generators.push(...brackets);
    }

    return generators;
  };

  const OperationBasisFunc = (generators) => {
    let operations = [...generators];
    while (operations.length) {
      let newOperations = [];
      for (let node of operations) {
        if (2 * node.weight > maxWeight) {
          continue;
        }
        let operationsList;
        if (node instanceof Operation) {
          operationsList = Array.from(
            {
              length: Math.min(n - 1, maxDim - 2 * node.degree, node.power) + 1,
            },
            (_, i) => new Operation(i, node)
          );
        } else {
          operationsList = Array.from(
            {
              length: Math.min(n - 1, maxDim - 2 * node.degree) + 1,
            },
            (_, i) => new Operation(i, node)
          );
        }
        newOperations.push(...operationsList);
      }
      generators.push(...newOperations);
      operations = [...newOperations];
    }
    return generators;
  };

  const ProductBasisFunc = (operationOrder) => {
    let generators = [...operationOrder];
    let products = [...operationOrder];
    while (products.length) {
      let newProducts = [];
      for (let node of products) {
        for (let [index, operation] of operationOrder.entries()) {
          if (operation.degree + node.degree > maxDim) {
            continue;
          }
          if (operation.weight + node.weight > maxWeight) {
            continue;
          }
          if ([Operation, Generator, Browder].includes(node.constructor)) {
            if (index > operationOrder.findIndex((e) => node.isEqual(e))) {
              let newProduct = new Product(operation, node);
              newProducts.push(newProduct);
            }
          }

          if (node instanceof Product) {
            
            if (index > operationOrder.findIndex((e) => node.next0.isEqual(e))) {
              let newProduct = new Product(operation, node);
              newProducts.push(newProduct);
            }
          }
        }
      }
      generators.push(...newProducts);
      products = [...newProducts];
    }
    return generators;
  };

  const monomialsToData = (monomials) => {
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
          edgesMap.get(ind).push(index);
          dualEdgesMap.get(index).push(ind);
          sq_list.push(index);
        }
        if (sq_list.length) {
          data_list[ind].ops[i] = sq_list;
        }
      }
    }

    let data = { gens: data_list };
    return [data, edgesMap, dualEdgesMap];
  };

  const browderOrder = BrowderBasisFunc();
  const operationOrder = OperationBasisFunc(browderOrder);
  const monomials = ProductBasisFunc(operationOrder).slice(baseDegs.length);
  return monomialsToData(monomials);
}
