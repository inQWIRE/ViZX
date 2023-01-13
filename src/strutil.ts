function isDigit(unicode: number) {
  return (unicode >= 48 && unicode <= 57);
}

const unicodeSubscriptOffset = 8272;

function toSubscript(unicode: number): string {
  if (!isDigit(unicode)) {
    return String.fromCharCode(unicode)
  }
  return String.fromCharCode(unicode + unicodeSubscriptOffset);
}

export function lastDigitsToSubscript(input: string): string { // TODO: Move to AST translation
  if (new RegExp("^[0-9]+$").test(input)) { // Do not subscript if only digits
    return input;
  }
  let split_input = input.split('');
  for (let i = split_input.length - 1; i >= 0; i--) {
    let curr = split_input[i]
    if (!isDigit(curr.charCodeAt(0))) {
      break;
    }
    split_input[i] = toSubscript(curr.charCodeAt(0));
  }
  return split_input.join('')
}