# Theme Customization

Override CSS variables defined in `src/styles/vars.css` for global theme customization.

## Variable Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `--vim-primary-color` | `#07c160` | Primary color (buttons, links) |
| `--vim-bg-color` | `#f5f5f5` | Background color |
| `--vim-border-color` | `#e7e7e7` | Border color |
| `--vim-bubble-left-bg` | `#ffffff` | Other's bubble background |
| `--vim-bubble-right-bg` | `#95ec69` | Self bubble background |
| `--vim-text-color` | `#1f1f1f` | Text color |
| `--vim-muted-text-color` | `#8b8b8b` | Muted text color |
| `--vim-font-size` | `14px` | Base font size |
| `--vim-border-radius` | `4px` | Border radius |
| `--vim-quote-bg` | `#f0f0f0` | Quote bar background |
| `--vim-quote-border` | `#d9d9d9` | Quote bar border |
| `--vim-menu-bg` | `#ffffff` | Context menu background |
| `--vim-menu-shadow` | `0 4px 12px rgba(0,0,0,0.12)` | Menu shadow |
| `--vim-status-sending` | `#8b8b8b` | Sending status color |
| `--vim-status-failed` | `#ff4d4f` | Failed status color |

## Usage

### 1. Global Override

In your app entry or root component:

```css
:root {
  --vim-primary-color: #6b5cff;
  --vim-bubble-right-bg: #e7e2ff;
  --vim-border-radius: 8px;
}
```

### 2. Via theme Prop

`VersatileIM` accepts a `theme` prop for runtime overrides:

```vue
<VersatileIM
  :theme="{
    primaryColor: '#6b5cff',
    bubbleRightBg: '#e7e2ff',
    borderRadius: '8px'
  }"
  ...
/>
```

---

## 中文

# 主题定制

通过覆盖 `src/styles/vars.css` 中定义的 CSS 变量实现全局主题定制。

### 变量列表

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--vim-primary-color` | `#07c160` | 主色（按钮、链接等） |
| `--vim-bg-color` | `#f5f5f5` | 背景色 |
| `--vim-bubble-left-bg` | `#ffffff` | 对方气泡背景 |
| `--vim-bubble-right-bg` | `#95ec69` | 己方气泡背景 |
| `--vim-font-size` | `14px` | 基础字号 |
| `--vim-border-radius` | `4px` | 圆角 |

### 使用方式

**全局覆盖**：在应用入口或根组件的 `:root` 中覆盖变量。

**theme prop**：`VersatileIM` 支持 `theme` prop，可运行时覆盖变量。
