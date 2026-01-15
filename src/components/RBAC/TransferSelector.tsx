import { Transfer, Tooltip } from 'antd'
import type { TransferItem } from 'antd/es/transfer'
import './TransferSelector.css'

interface Props {
  data: TransferItem[]
  targetKeys: React.Key[]
  onChange: (nextTargetKeys: React.Key[], direction?: 'left' | 'right', moveKeys?: React.Key[]) => void
  fluid?: boolean
  listWidth?: number
  listHeight?: number
  showSearch?: boolean
  sectionWidth?: number
  sectionHeight?: number
}

export default function TransferSelector({
  data,
  targetKeys,
  onChange,
  fluid = true,
  listHeight = 450,
  showSearch = true,
  sectionWidth = 600,
  sectionHeight,
}: Props) {
  const finalSectionHeight = (typeof sectionHeight === 'number' ? sectionHeight : listHeight)
  const styleVar = {
    ['--rbac-transfer-section-width']: `${sectionWidth}px`,
    ['--rbac-transfer-section-height']: `${finalSectionHeight}px`,
  } as React.CSSProperties
  return (
    <div className={fluid ? 'rbac-transfer-fluid' : undefined} style={styleVar}>
      <Transfer
        dataSource={data}
        targetKeys={targetKeys}
        onChange={onChange}
        render={(item) => (
          <Tooltip title={item.title}>
            <span className="rbac-transfer-item">{item.title ?? ''}</span>
          </Tooltip>
        )}
        filterOption={(inputValue, item) =>
          (item.title ?? '').toLowerCase().includes(String(inputValue).toLowerCase())
        }
        showSearch={showSearch}
        // 使用 CSS 变量控制 section 尺寸；列表与内容通过 CSS 100% 跟随
      />
    </div>
  )
}
