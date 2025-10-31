import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ItemList from '@/features/items/ItemList'
import React from 'react'

test('renders list', () => {
  render(<ItemList projectId="p" items={[{ id:'1', user_id:'u', project_id:'p', title:'Task', status:'todo', tags:[], position:1 }]} /> as any)
  expect(screen.getByDisplayValue('Task')).toBeInTheDocument()
})
