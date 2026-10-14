import React, { Component, type ReactNode } from 'react';

interface EBProps { fallback: ReactNode; children: ReactNode; }
interface EBState { hasError: boolean; }

export class ToothErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ToothErrorBoundary] 3D tooth failed to render — showing placeholder fallback.', error, info);
  }
  override render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default ToothErrorBoundary;
