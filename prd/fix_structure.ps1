# PRD结构修复脚本
# 将"验收标准"section从当前位置移到"详细方案"之后

$filePath = "d:\Project\vibe coding\webmodel\prd\prd_v1.0.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

# 找到各个section的位置
$sections = @(
    @{id="info"; title="项目基本信息"},
    @{id="boundary"; title="0. 产品边界"},
    @{id="background"; title="一、需求背景"},
    @{id="goals"; title="二、需求目标"},
    @{id="users"; title="三、用户与场景"},
    @{id="features"; title="四、需求功能清单"},
    @{id="details"; title="五、详细方案"},
    @{id="acceptance"; title="六、验收标准"},
    @{id="exception"; title="七、异常与边界"},
    @{id="flowcharts"; title="八、业务流程图"}
)

# 提取每个section的内容
$sectionContents = @{}
foreach ($section in $sections) {
    $pattern = "<section id=`"$($section.id)`"[^>]*>(.*?)</section>"
    if ($content -match $pattern) {
        $sectionContents[$section.id] = $matches[0]
    }
}

# 按正确顺序重新组合
$newContent = $content

# 找到content div的开始和结束
$contentStart = $content.IndexOf('<div class="content">')
$contentEnd = $content.LastIndexOf('</div>') + 6

# 重新构建content部分
$newContentPart = ""
$newContentPart += $content.Substring(0, $contentStart + 21) # 包含<div class="content">

# 按正确顺序添加section
foreach ($section in $sections) {
    if ($sectionContents.ContainsKey($section.id)) {
        $newContentPart += "`n`n        " + $sectionContents[$section.id]
    }
}

$newContentPart += "`n`n    </div>`n</body>`n</html>"

# 写回文件
$newContentPart | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline

Write-Host "PRD结构已修复完成！" -ForegroundColor Green
Write-Host "Section顺序已调整为正确的逻辑顺序" -ForegroundColor Yellow
