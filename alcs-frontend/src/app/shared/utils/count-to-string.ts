export const countToString = (count: number) => {
  var arr = [];
  while(count >> 0 > 0){
    arr.unshift(String.fromCharCode(97 + --count % 26));
    count /= 26
  }
  return arr.join("")
};
