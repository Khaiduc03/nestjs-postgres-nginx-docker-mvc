export function getRandomItemInObject(array: any[], count: number) {
  const shuffledArray = array.slice(); // Tạo một bản sao của mảng để không ảnh hưởng đến mảng gốc
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray.slice(0, count);
}

export function random4DigitNumber() {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;

  return randomNumber;
}
