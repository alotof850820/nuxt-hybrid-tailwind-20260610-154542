declare module '@tabler/icons-vue/dist/esm/icons/*.mjs' {
  import type { FunctionalComponent, SVGAttributes } from 'vue'

  type TablerIconProps = SVGAttributes & {
    color?: string
    size?: number | string
    stroke?: number | string
    title?: string
  }

  const icon: FunctionalComponent<TablerIconProps>
  export default icon
}
