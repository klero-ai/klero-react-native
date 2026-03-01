import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type {
  KleroConfig,
  SurveyCompletedEvent,
  SurveyClosedEvent,
  KleroMessage,
} from './types';

/**
 * Props for the KleroSurvey component
 */
export interface KleroSurveyProps extends KleroConfig {
  /** The survey's unique identifier */
  surveyUlid: string;
  /** Custom styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Callback when the survey is completed */
  onComplete?: (data: SurveyCompletedEvent) => void;
  /** Callback when the survey is closed */
  onClose?: (data: SurveyClosedEvent) => void;
  /** Callback when the survey fails to load */
  onError?: (error: string) => void;
  /** Callback when the WebView finishes loading */
  onLoad?: () => void;
}

/**
 * Imperative handle for the KleroSurvey component
 */
export interface KleroSurveyHandle {
  /** Open the survey (optionally with a different survey ULID) */
  open: (surveyUlid?: string) => void;
  /** Close the survey */
  close: () => void;
}

/**
 * Escape string for safe JSON embedding in HTML
 */
function escapeForHtmlAttr(str: string): string {
  return str
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * KleroSurvey component for displaying Klero surveys in React Native apps
 *
 * @example
 * ```tsx
 * import { KleroSurvey } from '@klero/react-native';
 *
 * function App() {
 *   return (
 *     <KleroSurvey
 *       projectSlug="myproject"
 *       surveyUlid="01ABC123..."
 *       onComplete={(data) => {
 *         console.log('Survey completed:', data.responseUlid);
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const KleroSurvey = forwardRef<KleroSurveyHandle, KleroSurveyProps>(
  (
    {
      projectSlug,
      baseUrl,
      surveyUlid,
      customerToken,
      style,
      onComplete,
      onClose,
      onError,
      onLoad,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);

    // Determine the domain to load from
    const domain = baseUrl || `https://${projectSlug}.klero.ai`;

    // Build configuration object for the embed
    const embedConfig: Record<string, unknown> = {
      surveyUlid,
      projectId: projectSlug,
      baseUrl: domain,
    };
    if (customerToken) {
      embedConfig.customerToken = customerToken;
    }

    // HTML content for the WebView
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    html, body { height: 100%; margin: 0; background: transparent; }
    klero-survey { display: block; }
  </style>
  <script src="${domain}/embed/klero.js" async></script>
</head>
<body>
  <klero-survey data-config='${escapeForHtmlAttr(JSON.stringify(embedConfig))}'></klero-survey>
</body>
</html>`;

    // Handle messages from the WebView
    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const message = JSON.parse(
            event.nativeEvent.data
          ) as KleroMessage<unknown>;

          switch (message.type) {
            case 'klero:survey:completed':
              onComplete?.(message.data as SurveyCompletedEvent);
              break;
            case 'klero:survey:closed':
              onClose?.(message.data as SurveyClosedEvent);
              break;
            case 'klero:survey:error':
              onError?.((message.data as { error: string }).error);
              break;
          }
        } catch (e) {
          console.warn('Klero: Failed to parse message', e);
        }
      },
      [onComplete, onClose, onError]
    );

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      open: (ulid?: string) => {
        const targetUlid = ulid || surveyUlid;
        webViewRef.current?.injectJavaScript(
          `window.Klero.openSurvey('${targetUlid}');true;`
        );
      },
      close: () => {
        webViewRef.current?.injectJavaScript(
          'window.KleroSurvey.close();true;'
        );
      },
    }));

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl: domain }}
          onMessage={handleMessage}
          onLoad={onLoad}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
);

KleroSurvey.displayName = 'KleroSurvey';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
