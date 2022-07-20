export async function children(state, printVNode) {
  const { vnode } = state
  if (typeof vnode.children === 'string') {
    state.childLines.push(...(state.tagName === 'pre' ? [vnode.children] : vnode.children.split('\n')))
    state.isChildText = true
  } else if (Array.isArray(vnode.children)) {
    let isAllChildText
    for (const child of vnode.children) {
      const result = await printVNode(child)
      if (result.isText) {
        isAllChildText ??= true
        const text = result.lines[0]
        if (!state.childLines.length || /^\s/.test(text)) {
          state.childLines.push(text.trim())
        } else {
          state.childLines[state.childLines.length - 1] += text
        }
      } else {
        isAllChildText ??= false
        state.childLines.push(...result.lines)
      }
    }
    // TODO: see if this 'if' is even needed
    if (isAllChildText !== undefined) state.isChildText = isAllChildText
  }
}
