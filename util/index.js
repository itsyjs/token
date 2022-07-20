export * from './serialize.js'
export * from './formatting.js'
import { kebabCase, pascalCase } from './formatting.js'

export const getTagName = (vnode) => kebabCase(_getTagName(vnode))
function _getTagName(vnode) {
  if (typeof vnode.type === 'string') {
    return vnode.type
  } else if (vnode.type?.__asyncResolved) {
    const asyncComp = vnode.type?.__asyncResolved
    return asyncComp.name ?? getNameFromFile(asyncComp.__file)
  } else if (vnode.type?.name) {
    return vnode.type.name
  } else if (vnode.type?.__file) {
    return getNameFromFile(vnode.type.__file)
  }
  return 'anonymous'
}

function getNameFromFile (file) {
  const parts = /([^/]+)\.vue$/.exec(file)
  return parts
    ? pascalCase(parts[1])
    : 'anonymous'
}

export function createAutoBuildingObject (format, specialKeysHandler, key = '', depth = 0) {
  const cache = {}
  if (depth > 32) return { key, cache, target: {}, proxy: () => key }
  const target = () => {
    const k = key + '()'
    return format ? format(k) : k
  }
  const proxy = new Proxy(target, {
    get (_, p) {
      if (p === '__autoBuildingObject') {
        return true
      }
      if (p === '__autoBuildingObjectGetKey') {
        return key
      }
      if (specialKeysHandler) {
        const fn = specialKeysHandler(target, p)
        if (fn) {
          return fn()
        }
      }
      if (p === 'toString') {
        const k = key + '.toString()'
        return () => format ? format(k) : k
      }
      if (p === Symbol.toPrimitive) {
        return () => format ? format(key) : key
      }
      if (!cache[p]) {
        const childKey = key ? `${key}.${p.toString()}` : p.toString()
        const child = createAutoBuildingObject(format, specialKeysHandler, childKey, depth + 1)
        cache[p] = { key: childKey, ...child }
      }
      return cache[p].proxy
    },
    apply (_, thisArg, args) {
      const k = `${key}(${args.join(', ')})`
      return format ? format(k) : k
    },
  })
  return {
    key,
    cache,
    target,
    proxy,
  }
}
