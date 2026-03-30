# 设计审美偏好记录

## 更新时间
2026-03-30

## 整体风格
- **现代感**：符合当前设计趋势，避免传统、陈旧的配色
- **专业感**：适合产品文档使用，配色严谨
- **舒适度**：柔和的色彩，减少视觉疲劳
- **清晰度**：颜色语义明确，易于理解

## 配色原则

### 1. 柔和背景色
- 使用淡色调作为节点背景
- 避免高饱和度的纯色
- 色彩轻盈，不压抑

### 2. 清晰的层次感
- 每个节点都有描边（stroke）
- 描边宽度：2px
- 描边颜色与背景色形成对比

### 3. 优雅的连接线
- 使用平滑的贝塞尔曲线
- 避免生硬的直线连接
- 曲线参数：`curve: 'basis'`

### 4. 统一的主题
- 所有流程图使用一致的配色逻辑
- 相同类型的节点使用相同的颜色
- 保持视觉一致性

## 颜色语义

### 🔵 蓝色系 - 开始、判断、功能节点
- **浅蓝** `#dbeafe` - 开始节点、功能节点
- **淡紫蓝** `#e0e7ff` - 判断节点、决策节点
- **描边色** `#3b82f6` / `#6366f1`

**适用场景**：
- 流程开始/结束
- 条件判断
- 功能操作
- 状态转换

### 🟢 绿色系 - 成功完成节点
- **浅绿** `#dcfce7` - 成功完成、正常使用
- **描边色** `#10b981`

**适用场景**：
- 操作成功
- 正常状态
- 完成节点
- 可用状态

### 🟠 橙色系 - 用户操作节点
- **浅橙** `#fef3c7` - 用户点击、用户选择
- **浅黄** `#fef9c3` - 警告、降级处理
- **描边色** `#f59e0b` / `#eab308`

**适用场景**：
- 用户操作
- 等待用户输入
- 警告提示
- 降级方案

### 🔴 红色系 - 错误、删除节点
- **浅红** `#fee2e2` - 错误提示、删除操作
- **描边色** `#ef4444`

**适用场景**：
- 错误状态
- 删除操作
- 异常情况
- 失败节点

### 🟣 紫色系 - 判断/分支节点
- **浅紫** `#f3e8ff` - 条件分支、多路径
- **描边色** `#a855f7`

**适用场景**：
- 条件判断
- 多分支选择
- 复杂逻辑
- 决策节点

### 🩷 粉色系 - 特定功能节点
- **浅粉** `#fce7f3` - 面积测量相关
- **描边色** `#ec4899`

**适用场景**：
- 特定功能模块
- 面积测量
- 特殊操作

## 避免的配色

### ❌ 避免高饱和度纯色
- 不使用：`#3b82f6` (纯蓝)
- 不使用：`#10b981` (纯绿)
- 不使用：`#ef4444` (纯红)

### ❌ 避免生硬的配色
- 不使用过于鲜艳的颜色
- 不使用对比度过高的配色
- 不使用传统、陈旧的配色方案

### ❌ 避免单调的配色
- 不使用单一色调
- 不使用缺乏层次感的配色
- 不使用没有语义的配色

## 参考资源

- Figma流程图模板：https://www.figma.com/board/jXGWX05H4jkWBFHaOiBN0m/%E6%B5%81%E7%A8%8B%E5%9B%BE--Community-?node-id=0-1&p=f&t=1ddBDXSdR6dBto0d-0

## 应用场景

### 1. 流程图
- Mermaid流程图
- 业务流程图
- 用户旅程图
- 交互流程图

### 2. UI设计
- 按钮状态
- 提示信息
- 状态标签
- 图标颜色

### 3. 数据可视化
- 图表配色
- 数据标签
- 图例颜色
- 趋势线

## 配色方案示例

### Mermaid配置
```javascript
mermaid.initialize({ 
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
        primaryColor: '#e0e7ff',
        primaryTextColor: '#1e1b4b',
        primaryBorderColor: '#6366f1',
        lineColor: '#94a3b8',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        nodeBorder: '#cbd5e1',
        clusterBkg: '#f1f5f9',
        clusterBorder: '#94a3b8',
        titleColor: '#0f172a',
        edgeLabelBackground: '#ffffff',
        altBkg: '#fef3c7',
        altTextColor: '#78350f',
        altBorderColor: '#d97706',
        altClusterBkg: '#fef3c7',
        altClusterBorder: '#d97706',
        fillType0: '#dbeafe',
        fillType1: '#dcfce7',
        fillType2: '#fce7f3',
        fillType3: '#fef3c7',
        fillType4: '#e0e7ff',
        fillType5: '#fee2e2',
        fillType6: '#ccfbf1',
        fillType7: '#f3e8ff'
    },
    flowchart: { 
        useMaxWidth: false, 
        htmlLabels: true,
        curve: 'basis'
    }
});
```

### 节点样式示例
```mermaid
style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
style B fill:#dcfce7,stroke:#10b981,stroke-width:2px
style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
style D fill:#fee2e2,stroke:#ef4444,stroke-width:2px
style E fill:#f3e8ff,stroke:#a855f7,stroke-width:2px
style F fill:#fce7f3,stroke:#ec4899,stroke-width:2px
```

## 更新日志

### 2026-03-30
- 初始版本创建
- 基于流程图配色偏好整理
- 确定柔和、现代、专业的配色方向
- 定义颜色语义和使用场景
