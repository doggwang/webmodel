# PRD结构说明

## 当前问题

PRD文档中的章节顺序和标题编号不一致，导致导航混乱。

### 当前文档实际顺序（错误）
1. 项目基本信息
2. 0. 产品边界
3. 一、需求背景
4. 二、需求目标
5. **六、验收标准** ← 编号错误，应该是三，位置错误，应该在八之后
6. 三、用户与场景 ← 编号错误，应该是四
7. 四、需求功能清单 ← 编号错误，应该是五
8. 五、详细方案 ← 编号错误，应该是六
9. 七、异常与边界 ← 编号错误，应该是七
10. 八、业务流程图 ← 编号正确

### 正确的逻辑顺序
1. 项目基本信息
2. 0. 产品边界
3. 一、需求背景
4. 二、需求目标
5. 三、用户与场景
6. 四、需求功能清单
7. 五、详细方案
8. 六、验收标准 ← 应该移到这里
9. 七、异常与边界
10. 八、业务流程图

## 修复方案

需要调整文档中section的顺序，将"验收标准"章节从当前位置（第5个）移动到第8个位置（在"详细方案"之后）。

## 正确的导航栏结构

```html
<nav>
    <a href="#info" class="nav-link">项目基本信息</a>
    <a href="#boundary" class="nav-link">0. 产品边界</a>
    <a href="#background" class="nav-link">一、需求背景</a>
    <a href="#goals" class="nav-link">二、需求目标</a>
    <a href="#users" class="nav-link">三、用户与场景</a>
    <a href="#features" class="nav-link">四、需求功能清单</a>
    <a href="#details" class="nav-link">五、详细方案 (带原型)</a>
    <a href="#acceptance" class="nav-link">六、验收标准</a>
    <a href="#exception" class="nav-link">七、异常与边界</a>
    <a href="#flowcharts" class="nav-link">八、业务流程图</a>
</nav>
```

## 正确的文档section顺序

```html
<section id="info">项目基本信息</section>
<section id="boundary">0. 产品边界</section>
<section id="background">一、需求背景</section>
<section id="goals">二、需求目标</section>
<section id="users">三、用户与场景</section>
<section id="features">四、需求功能清单</section>
<section id="details">五、详细方案</section>
<section id="acceptance">六、验收标准</section>
<section id="exception">七、异常与边界</section>
<section id="flowcharts">八、业务流程图</section>
```

## 需要修改的标题编号

- id="users" 的标题从"三、用户与场景"改为"三、用户与场景"（保持不变）
- id="features" 的标题从"四、需求功能清单"改为"四、需求功能清单"（保持不变）
- id="details" 的标题从"五、详细方案"改为"五、详细方案"（保持不变）
- id="acceptance" 的标题从"六、验收标准"改为"六、验收标准"（保持不变）
- id="exception" 的标题从"七、异常与边界"改为"七、异常与边界"（保持不变）
- id="flowcharts" 的标题从"八、业务流程图"改为"八、业务流程图"（保持不变）

实际上，标题编号都是正确的，只是section的顺序需要调整！
