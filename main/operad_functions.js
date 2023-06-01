const factorial = (n) => {
    let result = 1;
    for (let i = 1; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
const combinations = (n, k) => {
return factorial(n) / (factorial(k) * factorial(n - k));
}

export { combinations };