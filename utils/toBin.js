export default function toBin(intNum) {
  var answer = '';
  if (/\d+/.test(intNum)) {
    while (intNum != 0) {
      answer = Math.abs(intNum % 2) + answer;
      intNum = parseInt(intNum / 2);
    }
    if (answer.length == 0) answer = '0';
    return answer;
  } else {
    return 0;
  }
}
