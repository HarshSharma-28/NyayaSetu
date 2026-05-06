'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import SectionError from './SectionError';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorBoundary] Caught error in ${this.props.sectionName}:`, error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SectionError 
          sectionName={this.props.sectionName} 
          onRetry={this.handleRetry} 
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}
