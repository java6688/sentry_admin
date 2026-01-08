# 实现 React 路由页面缓存方案

## 1. 方案概述

使用 React Router Dom v7 提供的 `KeepAlive` 组件实现指定路由页面的缓存，当用户跳转到其他页面再返回时，保持原页面的状态不刷新。

## 2. 实现步骤

### 2.1 修改路由配置

在 `App.tsx` 中引入并使用 `KeepAlive` 组件，为需要缓存的路由添加缓存功能：

* 引入 `KeepAlive` 组件

* 使用 `KeepAlive` 包裹需要缓存的路由

* 配置 `include` 属性指定需要缓存的路由路径

### 2.2 配置需要缓存的页面

根据项目需求，确定需要缓存的页面：

* Dashboard 页面：需要缓存筛选条件、表格数据等状态

* 其他页面可根据需求选择性缓存

### 2.3 实现缓存逻辑

* 在 `App.tsx` 中配置 `KeepAlive` 组件

* 为需要缓存的路由添加 `keepalive` 属性或使用 `include` 配置

* 确保组件的 `key` 或 `id` 正确设置，以便 `KeepAlive` 能准确识别和缓存组件

## 3. 代码修改点

### 3.1 App.tsx

```tsx
// 引入 KeepAlive 组件
import { BrowserRouter, Routes, Route, Navigate, KeepAlive } from 'react-router-dom'

// 修改路由配置
function App() {
  return (
    <BrowserRouter>
      <KeepAlive include={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/error/:id" element={<ErrorDetail />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </KeepAlive>
    </BrowserRouter>
  )
}
```

## 4. 预期效果

* 当用户从 Dashboard 页面跳转到 ErrorDetail 页面，再返回 Dashboard 时

* Dashboard 页面的状态（筛选条件、表格数据、选中项等）将保持不变

* 不会重新触发 `useEffect` 中的数据请求

* 提升用户体验，避免重复加载数据

## 5. 注意事项

* `KeepAlive` 组件仅在 React Router v6.4+ 版本中可用

* 确保组件具有稳定的 `key` 或 `id`

* 对于动态路由，需要正确配置缓存规则

* 注意内存占用，不要缓存过多不必要的页面

