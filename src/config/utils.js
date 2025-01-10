const avatars = import.meta.glob('@/assets/*.png', { eager: true })

export const getAvatar = (name) => {
  const key = Object.keys(avatars).find(path => path.includes(`${name}.png`))
  return key ? avatars[key].default : ''
}
