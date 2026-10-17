$matrixPath = Join-Path (Get-Location) 'outputs/cloud-pet-demo/docs/coverage-matrix.csv'
$rows = Import-Csv -LiteralPath $matrixPath
foreach ($row in $rows) {
  switch ($row.'编号') {
    'S06' { $row.'浏览器实测' = '公网员工跟进→联系人→编辑复制话术→授权订阅模拟→返回已联系已实际操作；无经营金额或管理入口' }
    'Q02' { $row.'浏览器实测' = '公网桌面表单必填、0/8及7/8勾选时拒绝pass提交通过；没有保存伪造真机记录；实际手机填写待用户' }
    'Q03' { $row.'浏览器实测' = '公网空场景4页与重置恢复通过；满档18时段及确认全部禁用；次日恢复16时段与可用按钮；重置通过' }
  }
  if ($row.'编号' -in @('S06','Q02','Q03')) { $row.'浏览器证据文件' += '; docs/business-public-supplement.json' }
  if ($row.'编号' -eq 'V05') { $row.'浏览器实测' += '; 公网主题弹层实际切换核验夏B/秋A默认与无破图'; $row.'浏览器证据文件' += '; docs/public-theme-controls.json' }
}
$rows | Export-Csv -LiteralPath $matrixPath -NoTypeInformation -Encoding utf8
Write-Output 'Updated four evidence rows; hardware columns retained.'
