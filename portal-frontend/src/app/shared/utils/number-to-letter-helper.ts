// A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
// AA AB AC AD AE ....

export const getLetterCombinations = (num: number): string => {
  let result = '';
  let quotient = num + 1;

  while (quotient > 0) {
    let remainder = quotient % 26;

    let letter = String.fromCharCode(remainder + 64);
    if (remainder === 0) {
      letter = 'Z';
      quotient--;
    }

    result = letter + result;
    quotient = Math.floor((quotient - 1) / 26);
  }

  return result;
};
