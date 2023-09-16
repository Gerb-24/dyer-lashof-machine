function range(startValue, endValue){
    const rangeArr = []
    for( let i=startValue; i<endValue; i++ ){
        rangeArr.push(i)
    }
    return rangeArr
}

console.log(range(2,8))