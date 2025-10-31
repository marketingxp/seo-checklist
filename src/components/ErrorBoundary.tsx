import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) { console.error('ErrorBoundary', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui' }}>
          <h1>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error.message || this.state.error)}</pre>
          <p>Open DevTools → Console for stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
