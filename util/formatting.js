// these are all taken from Vue's eslint utils

export function kebabCase(str) {
  return str
    .replace(/_/gu, '-')
    .replace(/\B([A-Z])/gu, '-$1')
    .toLowerCase()
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function camelCase(str) {
  if (isPascalCase(str)) {
    return str.charAt(0).toLowerCase() + str.slice(1)
  }
  return str.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ''))
}
function isPascalCase(str) {
  return !hasSymbols(str) && !/^[a-z]/u.test(str) && !/-|_|\s/u.test(str)
}
function hasSymbols(str) {
  return /[!"#%&'()*+,./:;<=>?@[\\\]^`{|}]/u.exec(str) // without " ", "$", "-" and "_"
}
export function pascalCase(str) {
  return capitalize(camelCase(str))
}

export function indent (lines, count = 1) {
  return lines.map(line => `${'  '.repeat(count)}${line}`)
}
