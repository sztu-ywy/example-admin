import type { StdTableColumn } from '@uozi-admin/curd'
import { datetimeRender } from '@uozi-admin/curd'

export function baseColumns(actionConfig?: StdTableColumn): StdTableColumn[] {
  return [
    {
      title: () => $gettext('Created At'),
      sorter: true,
      dataIndex: 'created_at',
      customRender: datetimeRender,
      width: 180,
    },
    {
      title: () => $gettext('Updated At'),
      sorter: true,
      dataIndex: 'updated_at',
      customRender: datetimeRender,
      width: 180,
    },
    {
      title: () => $gettext('Actions'),
      dataIndex: 'actions',
      width: 200,
      fixed: 'right',
      ...actionConfig,
    },
  ]
}
