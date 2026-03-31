// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button组件', () => {
  test('渲染基础按钮', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  test('点击按钮触发onClick事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击我</Button>);

    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('禁用状态下按钮不可点击', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>禁用按钮</Button>);

    const button = screen.getByText('禁用按钮');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('加载状态下显示加载指示器', () => {
    render(<Button loading>加载中</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('加载中');
  });
});